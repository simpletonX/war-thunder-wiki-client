import html2canvas from "html2canvas";
import { domToPng } from "modern-screenshot";

// html2canvas 通用导出函数
export async function exportElementToImage(node, options = {}) {
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  
  // options 可包含：scale, backgroundColor, useCORS
  const default_opts = {
    scale: window.devicePixelRatio || 1,
    backgroundColor: "#181e21", // null -> 保持原样（保留透明），或 '#fff' 指定白底
    useCORS: true, // 若页面有跨域图片，尝试使用 CORS
    logging: false,
    // 可以传入更多 html2canvas 的参数
  };
  const opts = Object.assign({}, default_opts, options);

  // html2canvas 返回 canvas
  const canvas = await html2canvas(node, {
    scale: opts.scale,
    backgroundColor: opts.backgroundColor,
    useCORS: opts.useCORS,
    logging: opts.logging,
    allowTaint: false,
  });
  // toDataURL -> base64 PNG
  downloadDataUrl(canvas.toDataURL("image/png"));
}

// modern-screenshot 通用导出函数
export async function modernScreenshot(node) {
  domToPng(node).then((dataUrl) => {
    const link = document.createElement("a");
    link.download = `screenshot-${+new Date()}.png`;
    link.href = dataUrl;
    link.click();
  });
}

// 自动下载
export async function downloadDataUrl(dataUrl) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `wt-wiki-${+new Date()}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
