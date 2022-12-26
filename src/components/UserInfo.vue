<template>
  <div v-if="userInfo">
    <p>{{userInfo.username}} is login.</p>
  </div>
  <div class="q-pa-md" v-if="userInfo">
    <p class="text-right" v-if="!userInfo.verify">
      <a href="javascript:void(0)" @click="sendMail">验证邮箱</a>
    </p>
    <p class="text-right">
      <a href="javascript:void(0)" @click="logout">注销</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { IAccount } from 'src/api/models/account';
import { sendVerify } from 'src/api/modules/account';
import { useAccountStore } from 'src/stores/account';
import { notify } from 'src/utils';
import { ref,  } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  info: any;
}
const props = withDefaults(defineProps<Props>(), {
  info: () => ({}),
});

const userInfo = ref<IAccount>(props.info);
console.log(userInfo.value)

const accountStore = useAccountStore();
const { push } = useRouter();
function logout() {
  accountStore.logout();
  push('/login')
}

async function sendMail() {
  let { email='', username } = userInfo.value;
  let rsp = await sendVerify({ email, username });
  notify(rsp.msg);
}

</script>
