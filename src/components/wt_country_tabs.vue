<template>
  <div
    class="country-tabs absolute z-100 w-[64px] left-[-90px] text-white"
  >
    <div
      class="country-tabs-container relative h-full flex justify-center content-center flex-wrap"
    >
      <div
        class="country-tab-item flex items-center w-full cursor-pointer flex justify-center"
        v-for="item in country_code"
        :class="{ active: modelValue == item }"
        @click="toggleCountry(item)"
      >
        <div class="country-icon">
          <img :src="`/static/country_ico/${item}.svg`" class="h-[18px]" />
        </div>
        <!-- <div class="text ml-[5px] text-[14px] font-[600]">{{ country_code_texts[item] }}</div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { country_code } from "@/utils/dict";

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
  /* #171c22 */
  background-image: linear-gradient(to bottom, transparent, #171c22, transparent);
}
.country-tabs {
  top: calc(50% - 330px);
  height: 660px;
}
.country-tab-item {
  height: 48px;
  border-bottom: 3px solid transparent;
  transition: 0.2s;
}
.country-tab-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
.country-tab-item.active {
  width: 200px;
  background-color: #444d5d;
}
@media (max-height: 779px) {
  .country-tabs {
    height: 600px;
  }
}
</style>
