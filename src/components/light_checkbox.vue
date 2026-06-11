<template>
  <!-- From Uiverse.io by preet_7613 -->
  <label class="container">
    <input type="checkbox" :checked="!!checked" @click="_click" />

    <!-- <div class="simple-text">GLOW STONE</div> -->

    <div class="lamp-block">
      <div class="face top">
        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>
      </div>

      <div class="face bottom">
        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>
      </div>

      <div class="face front">
        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>
      </div>

      <div class="face back">
        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>
      </div>

      <div class="face left">
        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>
      </div>

      <div class="face right">
        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>

        <div></div>
      </div>
    </div>
  </label>
</template>

<script setup>
const props = defineProps({
  checked: { type: Boolean },
});

const emit = defineEmits(["_click"]);
function _click() {
  emit("_click");
}
</script>

<style scoped>
.container {
  display: flex;

  flex-direction: column;

  align-items: center;

  position: relative;

  display: inline-block;

  cursor: pointer;

  user-select: none;

  perspective: 1000px;

  padding: 0;

  --size: 18px;
  --border: 1px;
}

.container input {
  position: absolute;

  opacity: 0;
}

.simple-text {
  position: absolute;

  bottom: 20px;

  color: white;

  font-size: 18pt;

  font-weight: 900;

  font-family: monospace;

  text-shadow: 2px 2px #000;
}

.lamp-block {
  position: absolute;

  left:50%;

  top:50%;

  width: var(--size);

  height: var(--size);

  transform-style: preserve-3d;

  /* transform: rotateX(-30deg) rotateY(45deg); */
  transform: translate(-50%, -50%) rotateX(-30deg) rotateY(45deg);

  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.face {
  position: absolute;

  width: var(--size);

  height: var(--size);

  display: grid;

  grid-template-columns: repeat(4, 1fr);

  grid-template-rows: repeat(4, 1fr);

  border: var(--border) solid #281910;

  box-sizing: border-box;

  background: #281910;
}

.face div {
  width: 100%;

  height: 100%;

  background-color: #4f3122;

  border: 1px solid rgba(0, 0, 0, 0.15);
}

/* Face Orientations - Z-axis is half of the width (50px) */

.top {
  transform: rotateX(90deg) translateZ(calc(var(--size) / 2));
}

.bottom {
  transform: rotateX(-90deg) translateZ(calc(var(--size) / 2));
}

.front {
  transform: rotateY(0deg) translateZ(calc(var(--size) / 2));
}

.back {
  transform: rotateY(180deg) translateZ(calc(var(--size) / 2));
}

.left {
  transform: rotateY(-90deg) translateZ(calc(var(--size) / 2));
}

.right {
  transform: rotateY(90deg) translateZ(calc(var(--size) / 2));
}

/* Pixel Variance for Texture */

.face div:nth-child(3n) {
  filter: brightness(110%);
}

.face div:nth-child(7n) {
  filter: brightness(80%);
}

/* ON STATE (Checked) */

.container input:checked ~ .lamp-block .face {
  border-color: #5b3a24;

  filter: drop-shadow(0px 0px 25px rgba(255, 174, 66, 0.5));
}

.container input:checked ~ .lamp-block .face div {
  background-color: #e58d4a;

  border-color: rgba(255, 255, 255, 0.1);
}

.container input:checked ~ .lamp-block .face div:nth-child(3n) {
  background-color: #f6b17a;
}

.container input:checked ~ .lamp-block .face div:nth-child(7n) {
  background-color: #b56732;
}

/* Interaction */

.container:hover .lamp-block {
  /* transform: rotateX(-30deg) rotateY(55deg); */
  transform: translate(-50%, -50%) rotateX(-30deg) rotateY(55deg);
}

.container:active .lamp-block {
  /* transform: rotateX(-30deg) rotateY(45deg) scale(0.9); */
  transform: translate(-50%, -50%) rotateX(-30deg) rotateY(45deg) scale(0.9);
}
</style>
