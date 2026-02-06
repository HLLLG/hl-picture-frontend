<template>
  <a-modal
    class="image-cropper"
    v-model:open="open"
    title="裁剪图片"
    :footer="null"
    @cancel="closeModal"
  >
    <!-- 图片裁剪组件 -->
    <vue-cropper
      ref="cropperRef"
      :img="imageUrl"
      outputType="png"
      :can-move-box="true"
      :auto-crop="true"
      :center-box="true"
      :info="true"
      :fixedBox="false"
    ></vue-cropper>
    <div style="margin-bottom: 16px"></div>
    <!-- 协同编辑操作 -->
    <div class="image-edit-actions" v-if="isTeamSpace">
      <a-space>
        <a-button v-if="editingUser" disabled>{{ editingUser.userName }} 正在编辑</a-button>
        <a-button v-if="canEnterEdit" type="primary" ghost @click="enterEdit">进入编辑</a-button>
        <a-button v-if="canExitEdit" danger ghost @click="exitEdit">退出编辑</a-button>
      </a-space>
    </div>
    <div style="margin-bottom: 16px"></div>
    <!-- 操作按钮 -->
    <div class="image-cropper-actions">
      <a-space>
        <a-button @click="rotateLeft" :disabled="!canEdit">向左旋转</a-button>
        <a-button @click="rotateRight" :disabled="!canEdit">向右旋转</a-button>
        <a-button @click="changeScale(1)" :disabled="!canEdit">放大</a-button>
        <a-button @click="changeScale(-1)" :disabled="!canEdit">缩小</a-button>
        <a-button type="primary" @click="handleConfirm" :disabled="!canEdit">确认</a-button>
      </a-space>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { uploadPictureUsingPost } from '@/api/pictureController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import PictureEditWebSocket from '@/utils/PictureEditWebSocket.ts'
import { PICTURE_EDIT_ACTION_ENUM, PICTURE_EDIT_MESSAGE_TYPE_ENUM } from '@/constants/Picture.ts'
import { SPACE_TYPE_ENUM } from '@/constants/Space.ts'

interface Props {
  imageUrl?: string
  picture?: API.PictureVO
  onSuccess?: (newPicture?: API.PictureVO) => void
  spaceId?: number
  space?: API.SpaceVO
}
const props = defineProps<Props>()

const isTeamSpace = computed(() => {
  return props.space?.spaceType === SPACE_TYPE_ENUM.TEAM
})

// 编辑器组建的引用
const cropperRef = ref()
// 改变图片大小
const changeScale = (num: number) => {
  num = num || 1
  cropperRef.value?.changeScale(num)
  if (num > 0) {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_IN)
  } else {
    editAction(PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT)
  }
}
// 向左旋转
const rotateLeft = () => {
  cropperRef.value?.rotateLeft()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT)
}
// 向右旋转
const rotateRight = () => {
  cropperRef.value?.rotateRight()
  editAction(PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT)
}

// 上传裁剪后的图片
const handleConfirm = () => {
  cropperRef.value?.getCropBlob((blob: Blob) => {
    const fileName = (props.picture?.name || 'image') + '.png'
    // 创建一个文件对象
    const file = new File([blob], fileName, { type: blob.type })
    // 调用上传函数
    handleUpload({ file })
  })
}

const loading = ref<boolean>(false)
/**
 * 上传图片
 *
 */
const handleUpload = async ({ file }: any) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPictureUsingPost(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      if (isTeamSpace.value) {
        // 发送保存编辑的消息
        websocket?.sendMessage({
          type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_SAVE,
        })
      }
      // 关闭裁剪组件
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    message.error('图片上传失败，' + error.message)
    console.error('图片上传失败，' + error)
  }
  loading.value = false
}

const open = ref<boolean>(false)

const openModal = () => {
  open.value = true
  // 团队空间才需要建立 WebSocket 连接
  console.log(props.space?.id)
  if (isTeamSpace.value) {
    initWebsocket()
  }
}

const closeModal = () => {
  open.value = false
  // 关闭 WebSocket 连接
  if (websocket) {
    websocket.disconnect()
    websocket = null
  }
  editingUser.value = undefined
}

// 暴露给父组件
defineExpose({
  openModal,
})

// -------------------实时编辑------------------
// 获取当前用户信息
const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser
// 正在编辑的用户
const editingUser = ref<API.UserVO>()
// 是否可以进入编辑状态
const canEnterEdit = computed(() => {
  return !editingUser.value
})
// 是否可以退出编辑状态
const canExitEdit = computed(() => {
  return editingUser.value?.id === loginUser?.id
})
// 是否可以编辑
const canEdit = computed(() => {
  // 不是团队空间，则默认可编辑
  if (!isTeamSpace.value) {
    return true
  }
  return editingUser.value?.id === loginUser?.id
})

let websocket: PictureEditWebSocket | null

// 初始化 WebSocket 连接，绑定事件
const initWebsocket = () => {
  const pictureId = props.picture?.id
  if (!pictureId || !loginUser) {
    return
  }
  // 防止重复创建连接
  if (websocket) {
    return
  }
  // 创建 WebSocket 实例
  websocket = new PictureEditWebSocket(pictureId)
  // 建立连接
  websocket.connect()

  // 监听通知消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.INFO, (msg) => {
    console.log('收到通知消息：', msg)
    message.info(msg.message)
  })

  // 监听错误消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ERROR, (msg) => {
    console.log('收到错误消息：', msg)
    message.error(msg.message)
  })

  // 监听进入编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT, (msg) => {
    console.log('收到进入编辑状态消息：', msg)
    editingUser.value = msg.user
    message.info(`${msg.user.userName} 进入了编辑状态`)
  })

  // 监听编辑操作消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION, (msg) => {
    console.log('收到编辑操作消息：', msg)
    message.info(msg.message)
    switch (msg.editAction) {
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_LEFT:
        rotateLeft()
        break
      case PICTURE_EDIT_ACTION_ENUM.ROTATE_RIGHT:
        rotateRight()
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_IN:
        changeScale(1)
        break
      case PICTURE_EDIT_ACTION_ENUM.ZOOM_OUT:
        changeScale(-1)
        break
    }
  })

  // 监听图片更新消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_SAVE, (msg: any) => {
    console.log('收到编辑保存消息：', msg)
    const saverId = msg.user?.id
    const isSelf = saverId && loginUser?.id && saverId === loginUser.id

    // 更新图片展示（所有人都更新）
    props.onSuccess?.(msg.picture)

    // 不是自己保存：关闭弹窗 + 清理编辑态
    if (!isSelf) {
      message.info(`${msg.user?.userName ?? '其他用户'} 已保存，编辑窗口将关闭`)
      closeModal()
    }
  })

  // 监听退出编辑状态消息
  websocket.on(PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT, (msg) => {
    console.log('收到退出编辑状态消息：', msg)
    editingUser.value = undefined
    message.info(`${msg.user.userName} 退出了编辑状态`)
  })
}

onUnmounted(() => {
  open.value = false
  // 关闭 WebSocket 连接
  if (websocket) {
    websocket.disconnect()
  }
  editingUser.value = undefined
})

// 进入编辑状态
const enterEdit = () => {
  if (websocket) {
    // 发送进入编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.ENTER_EDIT,
    })
  }
}

// 退出编辑状态
const exitEdit = () => {
  if (websocket) {
    // 发送退出编辑状态的消息
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EXIT_EDIT,
    })
  }
}

// 编辑图片操作
const editAction = (action: string) => {
  if (websocket) {
    // 发送编辑操作的请求
    websocket.sendMessage({
      type: PICTURE_EDIT_MESSAGE_TYPE_ENUM.EDIT_ACTION,
      editAction: action,
    })
  }
}
</script>

<style>
.image-cropper {
  text-align: center;
}

.image-cropper .vue-cropper {
  height: 400px !important;
}
</style>
