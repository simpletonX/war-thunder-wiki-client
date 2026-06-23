<template>
  <div
    class="country-tabs absolute z-100 w-[64px] left-[-82px] text-white"
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
        <div class="country-icon" v-html="country_icons[item]"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { country_code } from "@/utils/dict";
import { country_icons } from "@/utils/icon_svgs";

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);
function toggleCountry(item) {
  emit("update:modelValue", item);
}
</script>

<style>
.country-icon svg {
  height: 18px;
}
</style>

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
  background-color: rgba(255, 255, 255, 0.07);
}
.country-tab-item.active {
  background-color: #525e71;
}
@media (max-height: 779px) {
  .country-tabs {
    height: 600px;
  }
}
</style>
