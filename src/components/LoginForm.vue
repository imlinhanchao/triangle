<template>
    <div class="q-pa-md">
        <div class="q-mb-sm">
            <q-input standout v-model="login.username" type="text">
                <template v-slot:prepend>
                    <q-icon name="account_circle" />
                </template>
            </q-input>
        </div>
        <div class="q-mb-sm">
            <q-input standout v-model="login.passwd" type="password">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
            </q-input>
        </div>
        <div class="row">
            <q-btn class="col" color="white" text-color="black" label="登录" @click="submit" />
        </div>
        <div class="text-right text-overline text-weight-thin">
            <RouterLink class="text-link" to="/register">注册一个新账号</RouterLink>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ILogin } from 'src/api/models/account';
import { ref } from 'vue'
import { useAccountStore } from 'src/stores/account';
import { notify } from 'src/utils';
import { useRouter } from 'vue-router';

const login = ref<ILogin>({
    username: '',
    passwd: '',
})
const router = useRouter();

async function submit() {
    const accountStore = useAccountStore();
    let error = await accountStore.login(login.value);
    if (error) notify(error.message);
    else router.push('/');
}
</script>
<style lang="scss" scoped>
.text-link {
    color: #ccc;
    text-decoration: none;
    &:hover {
        border-bottom: 1px dashed #ccc;
    }
}
</style>