<template>
  <!-- 用户协议面板 -->
  <public_dialog :modelValue="modelValue" @update:modelValue="close_mask">
    <template #header>
      <div class="title flex justify-between items-center">
        <span>v{{ version }} 更新日志</span>
        <span class="text-[rgba(255,255,255,0.4)] text-[14px]"
          >2026-06-24 17:53</span
        >
      </div>
    </template>
    <template #main>
      <div class="text-[14px] mb-4 mt-2 w-[500px]">
        <div class="title text-[16px] font-bold mb-2">重构导出图像功能</div>
        <p class="leading-[26px]">
          - 重构旧版导出图像功能，位于右上角导航栏中。
        </p>

        <div class="title text-[16px] font-bold mb-2 mt-[30px]">
          校正科技树等级解锁所需数量，数据改动如下所示：
        </div>
        <p class="leading-[26px]">以色列地面科技树7级载具 4 -> 5</p>
        <p class="leading-[26px]">法国远洋海军科技树1级载具 4 -> 5</p>
        <p class="leading-[26px]">法国远洋海军科技树4级载具 4 -> 5</p>
        <p class="leading-[26px]">意大利远洋海军科技树1级载具 4 -> 5</p>
        <p class="leading-[26px]">意大利远洋海军科技树3级载具 4 -> 5</p>
        <p class="leading-[26px]">意大利远洋海军科技树3级载具 4 -> 5</p>
        <p class="leading-[26px]">日本远洋海军科技树3级载具 5 -> 6</p>
        <p class="leading-[26px]">日本远洋海军科技树4级载具 4 -> 5</p>
        <p class="leading-[26px]">英国近岸海军科技树2级载具 4 -> 5</p>
        <p class="leading-[26px]">苏联远洋海军科技树6级载具 3 -> 4</p>
        <p class="leading-[26px]">苏联近岸海军科技树1级载具 4 -> 5</p>
        <p class="leading-[26px]">德国远洋海军科技树3级载具 4 -> 5</p>
        <p class="leading-[26px]">德国远洋海军科技树4级载具 4 -> 5</p>
        <p class="leading-[26px]">德国近岸海军科技树1级载具 1 -> 2</p>
        <p class="leading-[26px]">德国近岸海军科技树2级载具 4 -> 5</p>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
const props = defineProps(["modelValue", "version"]);
const emit = defineEmits(["update:modelValue"]);

function close_mask() {
  emit("update:modelValue", false);
}
</script>
