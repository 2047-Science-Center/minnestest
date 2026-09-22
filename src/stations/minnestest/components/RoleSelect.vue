<script setup lang="ts">
/**
 * Rollval (ruta 3): två LIKVÄRDIGA kort med rollklipp. Valet är det könssiffran
 * mäter → loggas via store.chooseRole (chosen_role/role_presented_as).
 */
import { ref } from 'vue'
import { useI18n } from '@/station-kit/i18n'
import { ROLES, type RoleId } from '@/config'
import { useMinnestestStore } from '../store/minnestestStore'
import MediaSlot from './MediaSlot.vue'

const { t } = useI18n()
const store = useMinnestestStore()
const picked = ref<RoleId | null>(null)

function pick(id: RoleId): void {
  if (picked.value) return
  picked.value = id
  // Kort dröjning så det valda kortet hinner tändas / andra dämpas innan vidare.
  setTimeout(() => store.chooseRole(id), 650)
}
</script>

<template>
  <div class="roles">
    <header class="roles__head">
      <h2 class="roles__title ink-strong">{{ t('roleselect.title') }}</h2>
      <p class="roles__sub">{{ t('roleselect.subtitle') }}</p>
    </header>

    <div class="roles__cards">
      <article
        v-for="r in ROLES"
        :key="r.id"
        class="role-card"
        :class="{
          'role-card--picked': picked === r.id,
          'role-card--dim': picked && picked !== r.id,
        }"
      >
        <MediaSlot :id="r.media" />
        <h3 class="role-card__title">{{ t(`role.${r.id}.title`) }}</h3>
        <p class="role-card__blurb">{{ t(`role.${r.id}.blurb`) }}</p>
        <button class="crt-button crt-button--strong role-card__pick" :disabled="!!picked" @click="pick(r.id)">
          {{ t('roleselect.pick') }} ▸
        </button>
      </article>
    </div>
  </div>
</template>

<style scoped>
.roles {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  height: 100%;
}
.roles__head {
  text-align: center;
}
.roles__title {
  font-family: var(--font-retro);
  letter-spacing: 0.14em;
  margin: 0 0 0.3rem;
}
.roles__sub {
  color: var(--color-ink-muted);
  margin: 0;
}
.roles__cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  flex: 1;
  min-height: 0;
}
.role-card {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 1rem;
  border: 1px solid var(--color-primary-dim);
  border-radius: var(--radius, 8px);
  transition: opacity 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
.role-card--picked {
  border-color: var(--color-primary);
  box-shadow: var(--frame-glow, 0 0 16px rgba(255, 176, 0, 0.4));
}
.role-card--dim {
  opacity: 0.4;
}
.role-card__title {
  font-family: var(--font-retro);
  letter-spacing: 0.12em;
  color: var(--color-primary);
  margin: 0;
}
.role-card__blurb {
  color: var(--color-ink-strong);
  margin: 0;
  flex: 1;
}
.role-card__pick {
  align-self: flex-start;
}
@media (max-width: 820px) {
  .roles__cards {
    grid-template-columns: 1fr;
  }
}
</style>
