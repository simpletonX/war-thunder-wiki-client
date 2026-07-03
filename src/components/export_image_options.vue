<template>
  <public_dialog
    v-if="modelValue"
    :modelValue="modelValue"
    @update:modelValue="close_mask"
  >
    <template #header>
      <div class="title">导出图像选项</div>
    </template>
    <template #main>
      <div class="min-w-[460px] max-w-[720px]">
        <div
          class="calc_button flex justify-between mt-[30px] mb-[20px] pt-[18px]"
        >
          <div class="flex items-center">
            <div class="flex justify-center items-start">
              <Checkbox id="wait_image_load" v-model="wait_image_load" />
              <Label for="wait_image_load" class="ml-2 pt-[1px]"
                >等待载具图标加载完成</Label
              >
            </div>
            <div class="flex justify-center items-start">
              <Select v-model="image_quality">
                <SelectTrigger class="max-w-[310px]">
                  <SelectValue placeholder="请选择" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="quality_1">1x 快速</SelectItem>
                    <SelectItem value="quality_1_5">1.5x 均衡</SelectItem>
                    <SelectItem value="quality_2">2x 高清</SelectItem>
                    <SelectItem value="quality_3">3x 超清</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span class="ml-2 pt-[1px]">图像质量</span>
            </div>
          </div>
          <Button class="cir-btn" @click="export_image">
            <PhGitBranch :size="20" />
            <span class="mr-1">导出图像</span>
          </Button>
        </div>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { PhGitBranch } from "@phosphor-icons/vue";
import { ref } from "vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:modelValue",
  "export-image",
]);

const wait_image_load = ref(true);

function close_mask() {
  emit("update:modelValue", false);
}

function export_image() {
  emit("export-image");
}
</script>

<style scoped>
:deep(.main_role svg) {
  height: 14px !important;
}

.target-item {
  margin: 0 5px 20px;
  padding-right: 5px;
  padding-left: 62px;
  border-radius: 90px;
  background-color: rgba(255, 255, 255, 0.1);
  line-height: 32px;
}

.target-item img {
  position: absolute;
  bottom: 5px;
  left: 10px;
  width: 50px;
}

.target-item .arrow_to_end {
  position: absolute;
  top: 80%;
  color: #c1eaab;
  font-size: 20px;
}

.calc_button {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
</style>
