<template>
  <q-page class="row items-center justify-evenly">
    <component :is="form"></component>
  </q-page>
</template>
<script lang="ts">
import { preFetch } from 'src/utils';
export default {
  preFetch
};
</script>
<script setup lang="ts">
import { useAccountStore } from 'src/stores/account';
import { useRoute, useRouter } from 'vue-router';
import LoginForm from 'src/components/LoginForm.vue';
import RegisterForm from 'src/components/RegisterForm.vue';
import { computed } from 'vue';

const account = useAccountStore()
const info = account.user;

const { push } = useRouter()
if (info != null) {
  push('/')
}

const form = computed(() => useRoute().path == '/login' ? LoginForm : RegisterForm);

</script>
