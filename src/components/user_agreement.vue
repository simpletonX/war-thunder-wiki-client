<template>
  <!-- 用户协议面板 -->
  <public_dialog
    :modelValue="visible"
    @update:modelValue="close_mask"
  >
    <template #header>
      <div class="title flex justify-between items-center">
        <span>用户协议</span>
        <span class="text-[rgba(255,255,255,0.4)] text-[14px]">2026-06-23</span>
      </div>
    </template>
    <template #main>
      <div class="text-[14px] mb-4 mt-2 w-[500px]">
        <div class="title text-[16px] font-bold mb-2">前言</div>
        <p class="leading-[26px]">
          欢迎使用RP-Calculator，在您使用本服务的自动计算功能前，请务必仔细阅读并充分理解本《用户协议》的全部内容。当您以任何方式实际使用本服务，即表示您已阅读、理解并同意接受本协议的全部条款约束。本协议适用于您与本服务提供方之间关于使用本服务所产生的权利与义务关系。
        </p>

        <div class="title text-[16px] font-bold mb-2 mt-8">服务说明</div>
        <p class="leading-[26px]">
          本服务（RP-Calculator）是一款基于 Web
          技术构建的在线工具产品，旨在为用户提供《War Thunder》网络游戏科技树载具研发点数计算相关功能支持与数据处理能力。服务内容包括提供全自动算法辅助运算及用户自行操作计算，可能会根据业务需要进行调整、更新与优化，服务提供方（Blind-Thunder）保留对服务内容进行变更的权利，服务提供方在此声明，本服务中的所有研发计算相关功能永久免费对外开放，任何用户均可无需登录随时随地使用本服务。
        </p>

        <div class="title text-[16px] font-bold mb-2 mt-8">免责声明</div>
        <p class="leading-[26px]">
          本服务不会对任何第三方个人或组织进行倒卖授权，如果您通过付费购买到本服务链接，所有经济损失均由您个人承担。本服务中一键计算的算法已经过多阶段、大规模、全阵营覆盖的矩阵测试，在此过程中遇到的已知错误已得到修复并得以改进，但依旧不保证您在本服务中所使用的自动化计算结果会100%达到您的预期。
        </p>
        <p class="mt-2 leading-[26px]">
          在上线前最后阶段测试中计算结果与预期结果相差小于0.1%（误差仅发生在I级载具区域中，最终误差极小，可忽略不计）。本服务提倡用户自行审查计算结果是否完全达到预期，如有疑问或异常可申请加入QQ交流群或直接向开发者反馈。
        </p>
        <p class="mt-2 leading-[26px]">
          本服务由开发者（Blind-Thunder）维护与运营，相关功能与内容均基于开发者的意愿与实践进行实现。本服务的功能可能会根据实际情况进行调整或更新，开发者保留对本服务内容、功能说明及相关规则的最终解释权，并可能在不另行通知的情况下进行优化或变更。
        </p>
      </div>
    </template>
  </public_dialog>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(["close"]);
const visible = ref(true);

function close_mask() {
  visible.value = false;
  emit("close", true);
}
</script>
