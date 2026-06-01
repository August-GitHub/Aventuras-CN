<script lang="ts">
  import { SvelteMap } from 'svelte/reactivity'
  import { onDestroy } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { createDebouncedSave } from '$lib/utils/debounce'
  import { settings, DEFAULT_SERVICE_PRESET_ASSIGNMENTS } from '$lib/stores/settings.svelte'
  import type { GenerationPreset } from '$lib/types'
  import { ask } from '@tauri-apps/plugin-dialog'
  import {
    X,
    Settings2,
    RotateCcw,
    ChevronDown,
    Bot,
    BookOpen,
    Brain,
    Lightbulb,
    ListChecks,
    Sparkles,
    Search,
    Clock,
    Download,
    Wand2,
    Languages,
    Plus,
    Trash2,
    Check,
    Copy,
    AlertCircle,
    AlertTriangle,
  } from 'lucide-svelte'
  import { fetchModelsFromProvider, getReasoningExtraction } from '$lib/services/ai/sdk/providers'

  // Shadcn Components
  import * as Card from '$lib/components/ui/card'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import { Switch } from '$lib/components/ui/switch'
  import GenerationParamsForm from './GenerationParamsForm.svelte'

  // All system services that can be assigned to profiles
  const systemServices = [
    // Classification tasks
    {
      id: 'classifier',
      labelKey: 'agentProfiles.worldState',
      icon: Bot,
      descriptionKey: 'agentProfiles.worldStateDesc',
    },
    {
      id: 'lorebookClassifier',
      labelKey: 'agentProfiles.lorebookImport',
      icon: BookOpen,
      descriptionKey: 'agentProfiles.lorebookImportDesc',
    },
    {
      id: 'entryRetrieval',
      labelKey: 'agentProfiles.entryRetrieval',
      icon: Search,
      descriptionKey: 'agentProfiles.entryRetrievalDesc',
    },
    {
      id: 'characterCardImport',
      labelKey: 'agentProfiles.cardImport',
      icon: Download,
      descriptionKey: 'agentProfiles.cardImportDesc',
    },
    // Memory & Context tasks
    {
      id: 'memory',
      labelKey: 'agentProfiles.memorySystem',
      icon: Brain,
      descriptionKey: 'agentProfiles.memorySystemDesc',
    },
    {
      id: 'chapterQuery',
      labelKey: 'agentProfiles.chapterQuery',
      icon: Search,
      descriptionKey: 'agentProfiles.chapterQueryDesc',
    },
    {
      id: 'timelineFill',
      labelKey: 'agentProfiles.timelineFill',
      icon: Clock,
      descriptionKey: 'agentProfiles.timelineFillDesc',
    },
    // Suggestions tasks
    {
      id: 'suggestions',
      labelKey: 'agentProfiles.suggestions',
      icon: Lightbulb,
      descriptionKey: 'agentProfiles.suggestionsDesc',
    },
    {
      id: 'actionChoices',
      labelKey: 'agentProfiles.actionChoices',
      icon: ListChecks,
      descriptionKey: 'agentProfiles.actionChoicesDesc',
    },
    {
      id: 'styleReviewer',
      labelKey: 'agentProfiles.styleReviewer',
      icon: Sparkles,
      descriptionKey: 'agentProfiles.styleReviewerDesc',
    },
    {
      id: 'imageGeneration',
      labelKey: 'agentProfiles.imageGen',
      icon: Wand2,
      descriptionKey: 'agentProfiles.imageGenDesc',
    },
    {
      id: 'bgImageGeneration',
      labelKey: 'agentProfiles.bgImageGeneration',
      icon: Wand2,
      descriptionKey: 'agentProfiles.bgImageGenerationDesc',
    },
    // Agentic tasks
    {
      id: 'loreManagement',
      labelKey: 'agentProfiles.loreManager',
      icon: BookOpen,
      descriptionKey: 'agentProfiles.loreManagerDesc',
    },
    {
      id: 'agenticRetrieval',
      labelKey: 'agentProfiles.agenticRetrieval',
      icon: Search,
      descriptionKey: 'agentProfiles.agenticRetrievalDesc',
    },
    {
      id: 'interactiveVault',
      labelKey: 'agentProfiles.vaultAssistant',
      icon: BookOpen,
      descriptionKey: 'agentProfiles.vaultAssistantDesc',
    },
    // Wizard tasks
    {
      id: 'wizard:settingExpansion',
      labelKey: 'agentProfiles.settingExpansion',
      icon: Wand2,
      descriptionKey: 'agentProfiles.settingExpansionDesc',
    },
    {
      id: 'wizard:settingRefinement',
      labelKey: 'agentProfiles.settingRefinement',
      icon: Wand2,
      descriptionKey: 'agentProfiles.settingRefinementDesc',
    },
    {
      id: 'wizard:protagonistGeneration',
      labelKey: 'agentProfiles.protagonistGen',
      icon: Wand2,
      descriptionKey: 'agentProfiles.protagonistGenDesc',
    },
    {
      id: 'wizard:characterElaboration',
      labelKey: 'agentProfiles.characterElaboration',
      icon: Wand2,
      descriptionKey: 'agentProfiles.characterElaborationDesc',
    },
    {
      id: 'wizard:characterRefinement',
      labelKey: 'agentProfiles.characterRefinement',
      icon: Wand2,
      descriptionKey: 'agentProfiles.characterRefinementDesc',
    },
    {
      id: 'wizard:supportingCharacters',
      labelKey: 'agentProfiles.supportingCast',
      icon: Wand2,
      descriptionKey: 'agentProfiles.supportingCastDesc',
    },
    {
      id: 'wizard:openingGeneration',
      labelKey: 'agentProfiles.openingGen',
      icon: Wand2,
      descriptionKey: 'agentProfiles.openingGenDesc',
    },
    {
      id: 'wizard:openingRefinement',
      labelKey: 'agentProfiles.openingRefinement',
      icon: Wand2,
      descriptionKey: 'agentProfiles.openingRefinementDesc',
    },
    // Translation tasks
    {
      id: 'translation:narration',
      labelKey: 'agentProfiles.translateNarration',
      icon: Languages,
      descriptionKey: 'agentProfiles.translateNarrationDesc',
    },
    {
      id: 'translation:input',
      labelKey: 'agentProfiles.translateInput',
      icon: Languages,
      descriptionKey: 'agentProfiles.translateInputDesc',
    },
    {
      id: 'translation:ui',
      labelKey: 'agentProfiles.translateUi',
      icon: Languages,
      descriptionKey: 'agentProfiles.translateUiDesc',
    },
    {
      id: 'translation:suggestions',
      labelKey: 'agentProfiles.translateSuggestions',
      icon: Languages,
      descriptionKey: 'agentProfiles.translateSuggestionsDesc',
    },
    {
      id: 'translation:actionChoices',
      labelKey: 'agentProfiles.translateChoices',
      icon: Languages,
      descriptionKey: 'agentProfiles.translateChoicesDesc',
    },
    {
      id: 'translation:wizard',
      labelKey: 'agentProfiles.translateWizard',
      icon: Languages,
      descriptionKey: 'agentProfiles.translateWizardDesc',
    },
  ]

  const translatedSystemServices = $derived(
    systemServices.map((s) => ({
      ...s,
      label: $_(s.labelKey),
      description: $_(s.descriptionKey),
    })),
  )

  // State
  let editingPresetId = $state<string | null>(null)
  let activeTaskMenu = $state<string | null>(null)
  let resettingProfiles = $state(false)
  let isLoadingPresetModels = $state(false)

  // Auto-persist: debounced save to avoid a DB write on every slider tick
  const { trigger: debouncedSave, flush: flushSave } = createDebouncedSave(() =>
    settings.saveGenerationPresets(),
  )

  // Flush any pending save when the component is destroyed (e.g. Settings modal closed)
  onDestroy(() => flushSave())

  function getEditingPreset(): GenerationPreset | undefined {
    return settings.generationPresets.find((p) => p.id === editingPresetId)
  }

  const defaultAssignments = DEFAULT_SERVICE_PRESET_ASSIGNMENTS

  async function fetchModelsForPreset() {
    const preset = getEditingPreset()
    if (!preset?.profileId) return
    const profile = settings.getProfile(preset.profileId)
    if (!profile) return
    if (isLoadingPresetModels) return

    isLoadingPresetModels = true
    try {
      const result = await fetchModelsFromProvider(
        profile.providerType,
        profile.baseUrl,
        profile.apiKey,
      )
      await settings.updateProfile(profile.id, {
        ...profile,
        fetchedModels: result,
      })
      console.log(`[AgentProfiles] Fetched ${result.length} models from ${profile.providerType}`)
    } catch (error) {
      console.error('[AgentProfiles] Failed to fetch models:', error)
    } finally {
      isLoadingPresetModels = false
    }
  }

  // Memoized: compute service-to-profile mapping once per reactive update
  let servicesByProfile = $derived.by(() => {
    const map = new SvelteMap<string, (typeof translatedSystemServices)[number][]>()
    for (const service of translatedSystemServices) {
      const key = settings.servicePresetAssignments[service.id] || 'custom'
      let arr = map.get(key)
      if (!arr) {
        arr = []
        map.set(key, arr)
      }
      arr.push(service)
    }
    return map
  })

  function getServicesForProfile(profileId: string | 'custom') {
    return servicesByProfile.get(profileId) ?? []
  }

  const PRESET_NAME_KEYS: Record<string, string> = {
    classification: 'agentProfiles.presetClassification',
    memory: 'agentProfiles.presetMemory',
    suggestions: 'agentProfiles.presetSuggestions',
    agentic: 'agentProfiles.presetAgentic',
    wizard: 'agentProfiles.presetWizard',
    translation: 'agentProfiles.presetTranslation',
  }

  function tPresetName(preset: { id: string; name: string }): string {
    return PRESET_NAME_KEYS[preset.id] ? $_(PRESET_NAME_KEYS[preset.id]) : preset.name
  }

  function createNewPreset() {
    const newId = `preset-${Date.now()}`
    const defaultProfile = settings.getMainNarrativeProfile()
    const newPreset: GenerationPreset = {
      id: newId,
      name: $_('agentProfiles.newProfile'),
      description: '',
      profileId: defaultProfile?.id ?? settings.getDefaultProfileIdForProvider(),
      model: settings.apiSettings.defaultModel ?? '',
      temperature: 0.7,
      maxTokens: 4096,
      reasoningEffort: 'off',
      manualBody: '',
    }
    settings.generationPresets = [...settings.generationPresets, newPreset]
    settings.saveGenerationPresets()
    editingPresetId = newId
  }

  function startEditingPreset(preset: GenerationPreset) {
    flushSave() // flush any pending save before switching presets
    editingPresetId = preset.id
  }

  function closeEditingPreset() {
    flushSave()
    editingPresetId = null
  }

  async function handleDeletePreset(presetId: string) {
    const preset = settings.generationPresets.find((p) => p.id === presetId)
    if (!preset) return

    const confirmed = await ask(
      `${$_('settings.deleteProfileConfirm')} "${preset.name}"? ${$_('settings.deleteProfileWarning')}`,
      {
        title: $_('settings.confirmDelete'),
        kind: 'warning',
      },
    )

    if (confirmed) {
      settings.generationPresets = settings.generationPresets.filter((p) => p.id !== presetId)
      await settings.saveGenerationPresets()

      // Reset assignments - mutate in-memory then save once
      for (const service of systemServices) {
        if (settings.servicePresetAssignments[service.id] === presetId) {
          settings.servicePresetAssignments[service.id] = ''
        }
      }
      await settings.saveServicePresetAssignments()
    }
  }

  async function handleAssignPreset(serviceId: string, presetId: string | 'custom') {
    settings.setServicePresetId(serviceId, presetId === 'custom' ? '' : presetId)
  }

  async function handleApplyMainToAll() {
    const confirmed = await ask($_('settings.applyMainToAllConfirm'), {
      title: $_('settings.applyMainToAllTitle'),
      kind: 'warning',
    })
    if (!confirmed) return

    const mainProfileId = settings.apiSettings.mainNarrativeProfileId
    const mainModel = settings.apiSettings.defaultModel

    settings.generationPresets = settings.generationPresets.map((preset) => ({
      ...preset,
      profileId: mainProfileId,
      model: mainModel,
    }))
    await settings.saveGenerationPresets()
  }

  async function handleResetProfiles() {
    await settings.resetGenerationPresets()

    // Assign tasks to their default profiles
    for (const service of systemServices) {
      const presetId = defaultAssignments[service.id] || ''
      settings.setServicePresetId(service.id, presetId)
    }
  }

  function handleTaskClick(e: MouseEvent, serviceId: string) {
    e.stopPropagation()
    // Toggle the menu - if clicking same task, close it
    if (activeTaskMenu === serviceId) {
      activeTaskMenu = null
    } else {
      activeTaskMenu = serviceId
    }
  }

  async function moveTask(serviceId: string, targetProfileId: string | 'custom') {
    await handleAssignPreset(serviceId, targetProfileId)
    activeTaskMenu = null
  }

  // Helper to render a task item with inline menu
  function isTaskMenuOpen(serviceId: string): boolean {
    return activeTaskMenu === serviceId
  }
</script>

<div class="border-t pt-6">
  <div class="mb-4 flex items-start justify-between sm:items-center">
    <div>
      <h3 class="text-base font-medium">{$_('agentProfiles.title')}</h3>
      <p class="text-muted-foreground text-xs">{$_('agentProfiles.description')}</p>
    </div>
    <div class="flex items-center gap-2">
      {#if resettingProfiles}
        <span class="text-muted-foreground text-xs font-medium">{$_('agentProfiles.resetAll')}</span>
        <Button
          variant="ghost"
          size="sm"
          class="text-muted-foreground hover:text-foreground w-5 px-0 hover:bg-transparent"
          onclick={() => (resettingProfiles = false)}
          title={$_('agentProfiles.cancel')}
        >
          <X class="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="text-destructive w-5 px-0 hover:bg-transparent"
          onclick={() => {
            resettingProfiles = false
            handleResetProfiles()
          }}
          title={$_('agentProfiles.confirmReset')}
        >
          <Check class="h-3.5 w-3.5" />
        </Button>
      {:else}
        <Button
          variant="ghost"
          size="sm"
          onclick={() => (resettingProfiles = true)}
          title={$_('agentProfiles.resetToDefaultsTitle')}
          class="text-xs"
        >
          <RotateCcw class="mr-1 h-3 w-3" />
          {$_('agentProfiles.reset')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onclick={handleApplyMainToAll}
          title={$_('agentProfiles.applyMainTitle')}
          class="text-xs"
        >
          <Copy class="mr-1 h-3 w-3" />
          {$_('agentProfiles.applyMain')}
        </Button>
        <Button variant="secondary" size="sm" onclick={createNewPreset} class="text-xs">
          <Plus class="mr-1 h-3 w-3" />
          {$_('agentProfiles.newProfile')}
        </Button>
      {/if}
    </div>
  </div>

  {#if editingPresetId}
    {@const preset = getEditingPreset()}
    {#if preset}
      <Card.Root class="mb-6">
        <Card.Header class="pb-3">
          <div class="flex items-start justify-between">
            <Card.Title class="text-base">
              {settings.generationPresets.find((p) => p.id === editingPresetId)
                ? $_('agentProfiles.editProfile')
                : $_('agentProfiles.createProfile')}
            </Card.Title>
            <Button
              variant="text"
              size="icon"
              class="-mt-2 -mr-2 h-6 w-6"
              onclick={closeEditingPreset}
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
        </Card.Header>

        <Card.Content class="grid gap-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="grid gap-2">
              <Label>{$_('settings.name')}</Label>
              <Input
                type="text"
                bind:value={preset.name}
                oninput={() => debouncedSave()}
                placeholder={$_('agentProfiles.namePlaceholder')}
              />
            </div>
            <div class="grid gap-2">
              <Label>{$_('settings.description')}</Label>
              <Input
                type="text"
                bind:value={preset.description}
                oninput={() => debouncedSave()}
                placeholder={$_('agentProfiles.descriptionPlaceholder')}
              />
            </div>
          </div>

          <!-- Warning if no model or deleted profile -->
          {#if !preset.model || (preset.profileId && !settings.getProfile(preset.profileId))}
            <div
              class="flex items-center gap-2 rounded border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
              <AlertCircle class="h-4 w-4 shrink-0" />
              {$_('agentProfiles.noModelConfigured')}
            </div>
          {/if}

          <GenerationParamsForm
            profileId={preset.profileId ?? null}
            model={preset.model}
            temperature={preset.temperature}
            maxTokens={preset.maxTokens}
            reasoningEffort={preset.reasoningEffort}
            onProfileChange={async (id) => {
              const previousModel = preset.model
              preset.profileId = id
              await fetchModelsForPreset()
              const models = settings.getAvailableModels(
                preset.profileId || settings.getDefaultProfileIdForProvider(),
              )
              if (!models.find((m) => m.id === previousModel)) {
                preset.model = ''
              }
              debouncedSave()
            }}
            onModelChange={(m) => {
              preset.model = m
              debouncedSave()
            }}
            onTemperatureChange={(v) => {
              preset.temperature = v
              debouncedSave()
            }}
            onMaxTokensChange={(v) => {
              preset.maxTokens = v
              debouncedSave()
            }}
            onReasoningChange={(v) => {
              preset.reasoningEffort = v
              debouncedSave()
            }}
            onRefreshModels={fetchModelsForPreset}
            isRefreshingModels={isLoadingPresetModels}
            isManualMode={settings.advancedRequestSettings.manualMode}
          />

          <!-- Structured Output (unchanged) -->
          <div class="grid gap-2">
            <Label>{$_('settings.structuredOutput')}</Label>
            <div class="flex rounded-md border">
              {#each [['auto', $_('agentProfiles.auto')], ['on', $_('agentProfiles.forceOn')], ['off', $_('agentProfiles.forceOff')]] as [val, label] (val)}
                {@const isActive = (preset.structuredOutputOverride ?? 'auto') === val}
                <button
                  type="button"
                  class="flex-1 px-3 py-1.5 text-xs transition-colors first:rounded-l-md last:rounded-r-md {isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted/50'}"
                  onclick={() => {
                    preset.structuredOutputOverride = val as 'auto' | 'on' | 'off'
                    debouncedSave()
                  }}
                >
                  {label}
                </button>
              {/each}
            </div>
            <p class="text-muted-foreground text-xs">
              {$_('agentProfiles.structuredOutputDescription')}
            </p>
          </div>

          <!-- Thinking nudge (unchanged — only for openai-compatible / think-tag providers) -->
          {#if preset.profileId && (() => {
              const profile = settings.getProfile(preset.profileId)
              return profile && (profile.providerType === 'openai-compatible' || getReasoningExtraction(profile.providerType) === 'think-tag')
            })()}
            <div class="flex flex-row items-center justify-between gap-3">
              <div class="space-y-0.5">
                <Label class="text-sm">{$_('agentProfiles.thinkingNudge')}</Label>
                <p class="text-muted-foreground text-xs">
                  {$_('agentProfiles.thinkingNudgeDescription')}
                </p>
              </div>
              <Switch
                checked={!!preset.thinkingNudgePrompt}
                onCheckedChange={(v) => {
                  preset.thinkingNudgePrompt = !!v
                  debouncedSave()
                }}
              />
            </div>
          {/if}

          <!-- Manual Request Body (unchanged) -->
          {#if settings.advancedRequestSettings.manualMode}
            <div class="border-t pt-2">
              <Label class="mb-2 block">{$_('agentProfiles.manualRequestBody')}</Label>
              <Textarea
                bind:value={preset.manualBody}
                onblur={() => debouncedSave()}
                class="min-h-[100px] font-mono text-xs"
                rows={4}
                placeholder={'{"temperature": 0.7, "top_p": 0.9}'}
              />
              <p class="text-muted-foreground mt-1 text-xs">
                {$_('agentProfiles.manualRequestBodyDescription')}
              </p>
            </div>
          {/if}
        </Card.Content>
        <!-- No Card.Footer: auto-persist replaces explicit Save/Cancel -->
      </Card.Root>
    {/if}
  {/if}

  <div class="grid grid-cols-1 gap-4 pb-20 md:grid-cols-2 xl:grid-cols-3">
    {#each settings.generationPresets as preset (preset.id)}
      {#if preset.id !== editingPresetId}
        <Card.Root class="flex h-full flex-col">
          <div class="flex items-start justify-between border-b p-3 pb-2">
            <div class="min-w-0">
              <div class="truncate text-sm font-medium" title={tPresetName(preset)}>
                {tPresetName(preset)}
              </div>
              <div
                class="truncate text-xs"
                class:text-muted-foreground={preset.model}
                class:text-destructive={!preset.model}
                title={preset.model || $_('settings.modelNotConfigured')}
              >
                {preset.model || $_('settings.needToSetModel')}
              </div>
              {#if !preset.model}
                <div class="text-destructive mt-0.5 flex items-center gap-1 text-xs">
                  <AlertCircle class="h-3 w-3" />
                  {$_('settings.clickToConfigure')}
                </div>
              {:else if preset.profileId && !settings.getProfile(preset.profileId)}
                <div class="text-destructive mt-0.5 flex items-center gap-1 text-xs">
                  <AlertCircle class="h-3 w-3" />
                  {$_('settings.noApiProfile')}
                </div>
              {:else}
                {@const _profileId = preset.profileId || settings.getDefaultProfileIdForProvider()}
                {@const _models = settings.getAvailableModels(_profileId)}
                {@const _profile = settings.getProfile(_profileId)}
                {#if _models.length > 0 && !_models.find((m) => m.id === preset.model)}
                  <div class="mt-0.5 flex items-center gap-1 text-xs text-yellow-500">
                    <AlertTriangle class="h-3 w-3" />
                    {$_('settings.modelNotInProfile')}
                  </div>
                {:else if _models.length === 0 && _profile?.fetchedModels.length}
                  <div class="mt-0.5 flex items-center gap-1 text-xs text-red-500">
                    <AlertTriangle class="h-3 w-3" />
                    {$_('agentProfiles.noModelsAvailable')}
                  </div>
                {:else if _models.length === 0}
                  <div class="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                    {$_('agentProfiles.noModelsFetched')}
                  </div>
                {/if}
              {/if}
            </div>
            <div class="ml-2 flex shrink-0 gap-1">
              <Button
                variant="text"
                size="icon"
                class="text-muted-foreground hover:text-foreground h-6 w-6"
                onclick={() => startEditingPreset(preset)}
                title={$_('agentProfiles.editProfile')}
              >
                <Settings2 class="h-3 w-3" />
              </Button>
              <Button
                variant="text"
                size="icon"
                class="text-muted-foreground h-6 w-6 hover:text-red-500"
                onclick={() => handleDeletePreset(preset.id)}
                title={$_('agentProfiles.deleteProfile')}
              >
                <Trash2 class="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Card.Content class="bg-muted/30 flex flex-1 flex-col gap-2 p-3">
            {#each getServicesForProfile(preset.id) as service (service.id)}
              <div
                class="bg-background flex flex-col overflow-hidden rounded-md border shadow-sm transition-all"
              >
                <button
                  class="group hover:bg-muted/50 flex w-full items-center gap-2 p-2 text-left transition-colors select-none"
                  onclick={(e) => handleTaskClick(e, service.id)}
                  title={service.description}
                >
                  <service.icon class="text-primary h-3 w-3 shrink-0" />
                  <span class="flex-1 truncate text-xs">{service.label}</span>
                  <ChevronDown
                    class="text-muted-foreground ml-auto h-3 w-3 transition-transform {isTaskMenuOpen(
                      service.id,
                    )
                      ? 'rotate-180'
                      : ''}"
                  />
                </button>

                {#if isTaskMenuOpen(service.id)}
                  <div class="bg-muted/50 flex flex-col gap-0.5 border-t p-1">
                    <div
                      class="text-muted-foreground px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
                    >
                      {$_('agentProfiles.moveTo')}
                    </div>
                    {#each settings.generationPresets as targetPreset (targetPreset.id)}
                      {#if targetPreset.id !== preset.id}
                        <button
                          class="hover:bg-background w-full truncate rounded-sm px-2 py-1.5 text-left text-xs transition-colors"
                          onclick={(e) => {
                            e.stopPropagation()
                            moveTask(service.id, targetPreset.id)
                          }}
                        >
                          {tPresetName(targetPreset)}
                        </button>
                      {/if}
                    {/each}
                    <button
                      class="text-muted-foreground hover:bg-background mt-1 w-full rounded-sm border-t px-2 py-1.5 pt-1 text-left text-xs transition-colors"
                      onclick={(e) => {
                        e.stopPropagation()
                        moveTask(service.id, 'custom')
                      }}
                    >
                      {$_('agentProfiles.unassigned')}
                    </button>
                  </div>
                {/if}
              </div>
            {/each}
            {#if getServicesForProfile(preset.id).length === 0}
              <div
                class="text-muted-foreground flex flex-1 items-center justify-center py-2 text-xs italic"
              >
                {$_('agentProfiles.noTasksAssigned')}
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      {/if}
    {/each}

    <!-- Unassigned Card -->
    {#if getServicesForProfile('custom').length !== 0}
      <Card.Root class="bg-muted/20 flex h-full flex-col border-dashed">
        <div class="border-b p-3 pb-2">
          <div class="text-muted-foreground text-sm font-medium">{$_('agentProfiles.unassigned')}</div>
        </div>
        <Card.Content
          class="flex flex-1 flex-col gap-2 p-3 transition-all {getServicesForProfile('custom')
            .length > 0
            ? 'bg-muted/30'
            : ''}"
        >
          {#if getServicesForProfile('custom').length > 0}
            <div
              class="mb-2 rounded border border-amber-500/20 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-600 dark:text-amber-400"
            >
              {$_('agentProfiles.unassignedWarning')}
            </div>
          {/if}
          {#each getServicesForProfile('custom') as service (service.id)}
            <div
              class="bg-background flex flex-col overflow-hidden rounded-md border shadow-sm transition-all"
            >
              <button
                class="group hover:bg-muted/50 flex w-full items-center gap-2 p-2 text-left transition-colors select-none"
                onclick={(e) => handleTaskClick(e, service.id)}
                title={service.description}
              >
                <service.icon class="text-muted-foreground h-3 w-3 shrink-0" />
                <span class="flex-1 truncate text-xs">{service.label}</span>
                <ChevronDown
                  class="text-muted-foreground ml-auto h-3 w-3 transition-transform {isTaskMenuOpen(
                    service.id,
                  )
                    ? 'rotate-180'
                    : ''}"
                />
              </button>

              {#if isTaskMenuOpen(service.id)}
                <div class="bg-muted/50 flex flex-col gap-0.5 border-t p-1">
                  <div
                    class="text-muted-foreground px-2 py-1 text-[10px] font-bold tracking-wider uppercase"
                  >
                    {$_('agentProfiles.moveTo')}
                  </div>
                  {#each settings.generationPresets as targetPreset (targetPreset.id)}
                    <button
                      class="hover:bg-background w-full truncate rounded-sm px-2 py-1.5 text-left text-xs transition-colors"
                      onclick={(e) => {
                        e.stopPropagation()
                        moveTask(service.id, targetPreset.id)
                      }}
                    >
                      {tPresetName(targetPreset)}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
</div>
