<template>
  <div
    class="country-tabs fixed z-100 bottom-0 left-0 flex justify-center text-white w-full"
  >
    <div
      class="country-tabs-container w-[1300px] h-[46px] flex justify-center bg-[#171c22]"
    >
      <div
        class="country-tab-item flex items-center px-[15px] cursor-pointer"
        v-for="item in country_code"
        :class="{ active: modelValue == item }"
        @click="toggleCountry(item)"
      >
        <div class="country-icon">
          <img :src="`/static/country_ico/${item}.svg`" class="h-[18px]" />
        </div>
        <div class="text ml-[5px] text-[14px] font-[600]">{{ country_code_texts[item] }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { country_code } from "@/utils/dict";

const country_code_texts = {
  "usa": "美国",
  "germany": "德国",
  "ussr": "苏联",
  "britain": "英国",
  "japan": "日本",
  "china": "中国",
  "italy": "意大利",
  "france": "法国",
  "sweden": "瑞典",
  "israel": "以色列",
}

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);
function toggleCountry(item) {
  emit("update:modelValue", item);
}
</script>

<style scoped>
.country-tabs-container {
  border-top: 1px solid #293340;
}
.country-tab-item {
  border-bottom: 3px solid transparent;
  transition: 0.2s;
  opacity: 0.5;
}
.country-tab-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
  opacity: 1;
}
.country-tab-item.active {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: #ba4f32;
  opacity: 1;
}
</style>
