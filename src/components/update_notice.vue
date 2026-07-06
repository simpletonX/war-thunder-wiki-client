<template>
  <!-- 更新日志面板 -->
  <public_dialog :modelValue="modelValue" @update:modelValue="close_mask">
    <template #header>
      <div class="flex justify-between items-center">
        <span>v{{ version }} 更新日志</span>
        <span class="text-[rgba(255,255,255,0.4)] text-[14px]"
          >2026-07-03 20:50</span
        >
      </div>
    </template>
    <template #main>
      <div class="text-[14px] mb-2 mt-2 w-[520px]">
        <div class="quote mb-8">
          <div class="mb-2"><b>v3.21更新日志：</b></div>
          <p class="mb-2">
            同步最新科技树数据(版本2.57.0.27)，德国陆军科技树4.0银币载具组"M44/M55"更名为"M44/55"。苏联空军科技树13.7银币载具"米格-29K"更名为"米格-29KR"。
          </p>
          <p class="mb-2">
            未选中目标载具添加独立提示弹窗，并在弹窗内附带操作示例GIF图。
          </p>
          <p class="mb-2">远洋海军与近岸海军开放【一键计算】功能。</p>
        </div>
        <!-- v3.2 -->
        <div class="title">v3.2历史更新回顾：</div>
        <div class="quote mb-[10px]">
          <div class="mb-2"><b>重要更新内容一览：</b></div>
          <p class="mb-2">
            修复与游戏中的科技树数据不一致的问题（额外显示的隐藏银币载具会影响最终计算的研发点结果导致实际路线与游戏科技树不一致）。
          </p>
          <p class="mb-2">
            偏好设置新增选项【载具名称格式】用于切换当前科技树显示的载具名称格式（简中/繁中/英文）（默认为简中）。
          </p>
          <p>
            由于科技树数据结构改动，为了避免程序错误，本次版本更新将会强制执行一次【清理缓存】。
          </p>
        </div>
        <div class="quote fly_book_link mb-[30px]">
          <span>
            <span>➤&nbsp;详细说明&nbsp;&nbsp;</span>
            <a
              href="https://icnv6yvo8yvw.feishu.cn/wiki/JRG8wr2W7ixIWtktta9cstsfnhf"
              target="_blank"
              >https://icnv6yvo8yvw.feishu.cn/wiki/JRG8wr2W7ixIWtktta9cstsfnhf</a
            >
          </span>
        </div>
        <section>
          <div class="title">加载动画等待时长下调</div>
          <div class="text">
            加载动画默认最少等待时长从1.1秒下调至0.5秒。偏好设置移除【启用加载动画】选项，加载动画在全局范围内永远生效。：
          </div>
        </section>
        <section>
          <div class="title">修复显示隐藏的银币载具问题</div>
          <div class="text">
            修复与游戏中的科技树数据不一致的问题（额外显示的隐藏银币载具会影响最终计算的研发点结果导致实际路线与游戏科技树不一致）。
          </div>
        </section>
        <section>
          <div class="title">不存在的科技树类型不再显示</div>
          <div class="text">
            国家中不存在的科技树类型将不会再出现于可选项中，如瑞典-远洋海军。同时切换到不存在的科技树类型将会自动重定向到【陆军】。例如：从法国-远洋海军
            切换至 瑞典-远洋海军（不存在） 自动重定向至 瑞典-陆军。
          </div>
        </section>
        <section>
          <div class="title">偏好设置新增选项</div>
          <div class="text">
            偏好设置分类调整：个性化选项、数据模型选项、快捷操作选项。
          </div>
          <ul>
            <li>
              -
              新增选项【载具名称格式】用于切换当前科技树显示的载具名称格式（简中/繁中/英文）（默认为简中）。
            </li>
            <li>
              -
              新增选项【启用隐藏的银币载具】启用后，科技树中会显示隐藏的银币载具，最终在一键计算算法里会被当作正常的载具处理；关闭后，隐藏的银币载具不会出现在科技树中，也不会被算法处理（默认关闭）。
            </li>
            <li>
              -
              新增选项【导出图像质量】，可选择标准/高清/超清（建议使用高清）。导出图像功能在等待所有外层载具图标加载完成后才能开始绘制并下载图片（加载速度取决于Gaijin服务器是否抽风以及本地缓存是否过期）。
            </li>
          </ul>
        </section>
        <section>
          <div class="title">隐藏的银币载具新增特殊标识</div>
          <div class="text">
            隐藏的银币载具新增特殊标识：在载具的左上角会显示一个白色的斜条标签块，表示这是一个隐藏的银币载具（在游戏科技树中不存在的载具，已经被Gaijin隐藏）。
          </div>
        </section>
        <section>
          <div class="title">清理缓存功能改动</div>
          <div class="text">
            清理缓存功能从清除当前科技树选中状态数据调整为清除所有已保存的科技树选中状态数据。由于科技树数据结构改动，为了避免程序错误，本次版本更新将会强制执行一次【清理缓存】。每次切换【启用隐藏的银币载具】为启用或关闭时：由于科技树数据结构的变化，为了避免程序错误，将会强制执行一次【清理缓存】。
          </div>
        </section>
        <section>
          <div class="title">修复科技树请求失败时数据污染问题</div>
          <div class="text">
            修复科技树获取失败时的数据污染问题：当用户切换科技树且遇到请求错误时，会直接清空当前科技树数据并显示：科技树数据获取异常。以避免在当前科技树继续选中载具而导致数据污染。
          </div>
        </section>
      </div>
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

<style scoped>
.quote {
  padding: 18px;
  background-color: rgba(69, 83, 107, 0.2);
  border-radius: 7px;
  border-left: 4px solid #45536b;
  line-height: 22px;
  transition: 0.2s;
  word-break: break-all;
}
.title {
  font-size: 17px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 4px;
  margin-bottom: 15px;
}
img {
  margin-top: 15px;
  margin-bottom: 15px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  padding: 7px;
  border-radius: 7px;
}
section {
  margin-bottom: 40px;
}
.text {
  margin-bottom: 15px;
}
.fly_book_link {
  padding: 12px 15px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fly_book_link:hover a {
  text-decoration: underline;
}
.quote.fly_book_link:hover {
  background-color: rgba(69, 83, 107, 0.4);
  border-color: #6179a2;
}
.table {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 15px;
}
table {
  width: 100%;
  border-collapse: collapse;
  color: #fff;
  font-size: 14px;
}
thead {
  background: rgba(255, 255, 255, 0.05);
}
th {
  text-align: left;
  padding: 10px 0;
  font-weight: 600;
  text-align: center;
}
td {
  padding: 6px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  text-align: center;
}
tbody tr:hover {
  background: rgba(255, 255, 255, 0.04);
  transition: background 0.2s;
}
ul {
  padding-left: 20px;
  margin-bottom: 20px;
}
li {
  list-style-type: disc;
  line-height: 24px;
}
</style>
