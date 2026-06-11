<template>
  <div class="card" @click="handleClick">
    <div class="content">
      <div class="back">
        <div class="back-content">
          <svg
            width="24"
            height="24"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M44 16C44 22.6274 38.6274 28 32 28C29.9733 28 28.0639 27.4975 26.3896 26.6104L9 44L4 39L21.3896 21.6104C20.5025 19.9361 20 18.0267 20 16C20 9.37258 25.3726 4 32 4C34.0267 4 35.9361 4.50245 37.6104 5.38959L30 13L35 18L42.6104 10.3896C43.4975 12.0639 44 13.9733 44 16Z"
              fill="none"
              stroke="#fff"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  glowColor: {
    type: String,
    default: "#ff9966",
  },
});

const emit = defineEmits(["click"]);

const handleClick = (e) => {
  emit("click", e);
};
</script>

<style scoped>
.card {
  width: 44px;
  height: 44px;
  overflow: visible;
  perspective: 800px;
}

/* 3D容器 */
.content {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 300ms;
  /* box-shadow: 0px 0px 10px 1px #000000ee; */
  border-radius: 50%;
}

/* 正反面 */
.front,
.back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 50%;
  overflow: hidden;
  background-color: #151515;
}

/* 反面居中 */
.back {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 流光外圈 */
.back::before {
  position: absolute;
  content: "";
  display: block;

  width: 40px;
  height: 200%;

  background: linear-gradient(
    90deg,
    transparent,
    #83a5cb,
    #83a5cb,
    #83a5cb,
    #83a5cb,
    transparent
  );

  animation: rotation_481 5s infinite linear;
}

/* 内层内容 */
.back-content {
  position: absolute;
  width: 93%;
  height: 93%;
  border-radius: 50%;
  background-color: #151515;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 6px;
  font-size: 10px;
}

/* hover效果（可选） */
.card:hover .content {
  transform: rotateY(20deg) rotateX(10deg);
}

/* 动画修复 */
@keyframes rotation_481 {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
