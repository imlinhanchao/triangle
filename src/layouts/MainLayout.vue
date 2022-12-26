<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title>
          <img src="/logo.png" height="30" class="q-mr-sm vertical-middle"/>
          <span class="vertical-middle text-weight-bold">{{ pkg.productName }}</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { pkg } from 'src/utils'
</script>
