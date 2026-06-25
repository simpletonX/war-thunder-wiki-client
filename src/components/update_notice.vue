<template>
  <!-- 用户协议面板 -->
  <public_dialog :modelValue="modelValue" @update:modelValue="close_mask">
    <template #header>
      <div class="title flex justify-between items-center">
        <span>v{{ version }} 更新日志</span>
        <span class="text-[rgba(255,255,255,0.4)] text-[14px]"
          >2026-06-25 13:12</span
        >
      </div>
    </template>
    <template #main>
      <!-- <div class="text-[14px] mb-4 mt-2 w-[500px]"> -->
        <!-- <div class="title text-[16px] font-bold mb-2">部分修复上下滚动时造成的图标、载具文字信息丢失问题。</div> -->
        <!-- <p class="leading-[26px]">
          - 新增载具数据M1A2 SEPv3、M1A2/战利品-HV 型、澳大利亚 M1A1/A2、T-90M/竞技场-M、美洲狮u14、F-14D...
        </p> -->

        <!-- <div class="title text-[16px] font-bold mb-2 mt-[30px]">修复日本陆军科技树一级新载具“Ho-Ni II”的向下联动箭头指向错误问题。</div> -->
        <!-- <p class="leading-[26px]">
          - 重构旧版导出图像功能，位于右上角导航栏中。
        </p> -->

        <!-- <div class="title text-[16px] font-bold mb-2 mt-[30px]">自动计算按钮替换新图标。</div> -->
        <!-- <p class="mb-1">部分修复上下滚动时造成的图标、载具文字信息丢失问题。</p>
        <p class="mb-1">修复日本陆军科技树一级新载具“Ho-Ni II”的向下联动箭头指向错误问题。</p>
        <p class="mb-1">自动计算按钮替换新图标。</p> -->
      <!-- </div> -->
      <iframe src="https://icnv6yvo8yvw.feishu.cn/wiki/NL5TwuOySiTlZnkCCq9cQWbUnpg" class="w-[700px] h-[500px] mb-2 rounded-2xl" frameborder="0"></iframe>
    </template>
  </public_dialog>
</template>

<script setup>
const props = defineProps(["modelValue"]);
const emit = defineEmits(["update:modelValue"]);
const version = import.meta.env.VITE_APP_VERSION;

function close_mask() {
  emit("update:modelValue", false);
}
</script>
