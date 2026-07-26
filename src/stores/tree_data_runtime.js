import { ref } from "vue";
import { getStorage, setStorage } from "@/utils/storage";

export function createTreeRuntimeState() {
  const loading_visible = ref(false);
  let show_time = 0;
  let hide_timer = null;
  const MIN_DURATION = 700;
  let minimum_duration = MIN_DURATION;

  const loading = {
    show(minimumDuration = MIN_DURATION) {
      clearTimeout(hide_timer);
      minimum_duration = Number.isFinite(minimumDuration)
        ? Math.max(0, minimumDuration)
        : MIN_DURATION;
      loading_visible.value = true;
      show_time = Date.now();
    },

    hide: async (callback) => {
      const hide = async () => {
        if (callback) {
          await callback(() => {
            loading_visible.value = false;
          });
        } else {
          loading_visible.value = false;
          console.log("hide");
        }
      };
      const elapsed = Date.now() - show_time;

      if (elapsed >= minimum_duration) {
        await hide();
        return;
      }

      hide_timer = setTimeout(hide, minimum_duration - elapsed);
    },
  };

  const agreement_accepted = ref(
    getStorage("agreement_accepted", { read: false }),
  );

  function updateAgreementAccepted(read) {
    agreement_accepted.value = { read };
    setStorage("agreement_accepted", { read });
  }

  function checkAndShowUpdateNotice() {
    const cache_version = getStorage("cache_version", "");
    console.log(cache_version);

    if (String(cache_version) !== import.meta.env.VITE_APP_VERSION) {
      setStorage("cache_version", import.meta.env.VITE_APP_VERSION);
      return false;
    }
    return true;
  }

  return {
    loading_visible,
    loading,
    agreement_accepted,
    updateAgreementAccepted,
    checkAndShowUpdateNotice,
  };
}
