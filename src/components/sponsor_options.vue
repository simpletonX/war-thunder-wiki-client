<template>
  <public_dialog :modelValue="modelValue" @update:modelValue="closeMask">
    <template #header>
      <div class="title">赞助一下</div>
    </template>

    <template #main>
      <div class="sponsor-options">
        <p class="sponsor-options__description">
          您的每一份支持，都会帮助网站持续维护与更新。快来为爱发电吧～
        </p>

        <div class="sponsor-options__group">
          <span class="sponsor-options__label">支付方式</span>
          <cir_tabs
            v-model="paymentMethod"
            :options="paymentOptions"
            name="sponsor-payment-method"
            aria-label="支付方式"
          />
        </div>

        <div
          v-if="paymentMethod === 'alipay'"
          class="sponsor-options__group"
        >
          <span class="sponsor-options__label">赞助金额</span>
          <cir_tabs
            v-model="amount"
            :options="amountOptions"
            name="sponsor-amount"
            aria-label="赞助金额"
          />
        </div>

        <div class="sponsor-options__qrcode mb-6">
          <div
            v-if="paymentMethod === 'wechat'"
            class="sponsor-options__wechat-code"
            role="img"
            aria-label="微信赞助二维码"
          ></div>
          <div
            v-else
            class="sponsor-options__alipay-code"
            :style="alipayCodeStyle"
            role="img"
            :aria-label="`支付宝赞助 ¥${amount} 二维码`"
          ></div>
        </div>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import cir_tabs from "@/components/cir_tabs.vue";

defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue"]);

const paymentMethod = ref("wechat");
const amount = ref(5);
const paymentOptions = [
  { id: "wechat", title: "微信" },
  { id: "alipay", title: "支付宝" },
];
const amountOptions = [5, 10, 20, 50, 100, 200].map((value) => ({
  id: value,
  title: `¥${value}`,
}));

// 支付宝收款图均为 1260 × 1890；二维码安全裁剪区为 x=220、y=682、820 × 820。
const alipayCodeStyle = computed(() => ({
  backgroundImage: `url(/static/pay/alipay_${amount.value}.jpg)`,
}));

function closeMask(value) {
  emit("update:modelValue", value);
}
</script>

<style scoped>
.sponsor-options {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 500px;
  padding: 2px 8px 6px;
}
.sponsor-options__description {
  margin: 0 0 22px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
}
.sponsor-options__group {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  margin-bottom: 14px;
}
.sponsor-options__label {
  flex: 0 0 58px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.72);
}
.sponsor-options__qrcode {
  display: grid;
  width: 200px;
  height: 200px;
  margin-top: 12px;
  overflow: hidden;
  place-items: center;
  border-radius: 12px;
  background: #fff;
}
.sponsor-options__wechat-code {
  width: 200px;
  height: 200px;
  background:
    url("/static/pay/wechat_pay.png")
    -140px -75px / 480px 480px
    no-repeat;
}
.sponsor-options__alipay-code {
  width: 200px;
  height: 200px;
  background-repeat: no-repeat;
  background-size: 307.3px 461px;
  background-position: -53.7px -166.3px;
}
.sponsor-options__hint {
  margin: 12px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.58);
}
</style>
