<template>
    <div class="q-pa-md">
        <div class="q-mb-sm">
            <q-input standout v-model="info.username" type="text">
                <template v-slot:prepend>
                    <q-icon name="account_circle" />
                </template>
            </q-input>
        </div>
        <div class="q-mb-sm">
            <q-input standout v-model="info.passwd" type="password">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
            </q-input>
        </div>
        <div class="q-mb-sm">
            <q-input standout v-model="info.email" type="email">
                <template v-slot:prepend>
                    <q-icon name="email" />
                </template>
            </q-input>
        </div>
        <div class="q-mb-sm">
            <q-input standout v-model="info.captcha" type="email" maxlength="4">
                <template v-slot:prepend>
                    <q-icon name="refresh" @click="rand=Math.random()"/>
                </template>
                <template v-slot:append>
                    <img :src="`/api/lib/captcha?r=${rand}`" class="captcha-img">
                </template>
            </q-input>
        </div>
        <div class="row">
            <q-btn class="col" color="green" text-color="white" label="注册" @click="submit" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { IRegister } from 'src/api/models/account';
import { ref } from 'vue'
import { useAccountStore } from 'src/stores/account';
import { notify } from 'src/utils';
import { useRouter } from 'vue-router';

const info = ref<IRegister>({
    username: '',
    passwd: '',
    email: '',
    captcha: '',
})
const router = useRouter();

async function submit() {
    const accountStore = useAccountStore();
    let error = await accountStore.register(info.value);
    if (error) notify(error.message);
    else router.push('/');
}

const rand = ref(Math.random());
</script>
<style lang="scss" scoped>
.captcha-img {
    background: #f2f2f2;
}
</style>