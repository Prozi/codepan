<template>
  <div
    v-if="codefundReady && codefundVisible && urlParams.headless !== 'true'"
    ref="codefund"
    class="codefund-container"
    @click="codefundVisible = false"
  >
    <div class="codefund-placeholder">Loading CodeFund...</div>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";

export default {
  data() {
    return {
      codefundReady: false,
      codefundVisible: true,
    };
  },
  computed: {
    ...mapState(["urlParams"]),
  },
  mounted() {
    this.$refs.codefund &&
      this.urlParams.headless !== "true" &&
      this.getCodeFund();
  },
  methods: {
    async getCodeFund() {
      try {
        const { data } = await axios.get(
          "https://codefund.io/properties/241/funder.html"
        );
        this.$refs.codefund.innerHTML = data;
        this.codefundReady = true;
      } catch (err) {
        this.codefundVisible = false;
      }
    },
  },
};
</script>
