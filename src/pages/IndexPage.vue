<template>
  <q-page class="row items-center justify-evenly">
    <user-info
      :info="info"
    ></user-info>
  </q-page>
</template>
<script lang="ts">
import { preFetch } from 'src/utils';
export default {
  preFetch
};
</script>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import UserInfo from 'src/components/UserInfo.vue';
import { useAccountStore } from 'src/stores/account';

const account = useAccountStore()
const info = account.user;

const { replace } = useRouter()
if (info == null) {
  replace('/login')
}

</script>
