<template>
  <q-page class="row items-center justify-evenly text-h5">
    <article v-if="error === ''">
      <section class="loading" v-if="loading" >
        <p><q-icon name="fa fa-spinner fa-pulse fa-2x fa-fw" /> 等待验证</p>
      </section>
      <section v-else class="verified text-center">
        <p class="text-h2 text-primary"><q-icon name="fa fa-envelope" /> </p>
        <p>您的邮箱已通过验证。 </p>
        <p>您可以开始使用 <b>{{ pkg.productName }}</b> 的所有功能。 </p>
      </section>
    </article>
    <article v-else>
      <p class="text-center text-h2 text-negative"><q-icon name="highlight_off" /></p>
      <p>{{ error }}</p>
    </article>
  </q-page>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import { pkg } from 'src/utils'
import { verify } from 'src/api/modules/account';

const loading = ref(true);
const error = ref('');

const { push } = useRouter()
const { params } = useRoute();

onMounted(async () => {
  loading.value = true;
  let { username, token }  = params as { [key :string]: string };
  let rsp = await verify({ username, token });
  if (rsp.state) error.value = rsp.msg;
  else {
    setTimeout(() => push('/'), 5000);
    loading.value = false;
  }
})

</script>
