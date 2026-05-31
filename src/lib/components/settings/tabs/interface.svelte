<script lang="ts">
  import { onMount } from 'svelte'
  import { _ } from 'svelte-i18n'
  import { settings, STORY_WIDTH_OPTIONS } from '$lib/stores/settings.svelte'
  import { ui } from '$lib/stores/ui.svelte'
  import { database } from '$lib/services/database'
  import { grammarService } from '$lib/services/grammar'
  import { THEMES } from '../../../../themes/themes'
  import { Switch } from '$lib/components/ui/switch'
  import { Slider } from '$lib/components/ui/slider'
  import { Label } from '$lib/components/ui/label'
  import * as Select from '$lib/components/ui/select'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Badge } from '$lib/components/ui/badge'
  import { ScrollArea } from '$lib/components/ui/scroll-area'
  import { Separator } from '$lib/components/ui/separator'
  import { getSupportedLanguages } from '$lib/services/ai/utils/TranslationService'
  import { updaterService } from '$lib/services/updater'
  import { RefreshCw, Loader2, Languages, Plus, X, Trash2 } from 'lucide-svelte'

  const storyWidthIndex = $derived(
    Math.max(
      0,
      STORY_WIDTH_OPTIONS.findIndex((o) => o.key === settings.uiSettings.storyMaxWidth),
    ),
  )

  let isCheckingUpdates = $state(false)
  let updateMessage = $state<string | null>(null)
  let customDictionaryWords = $state<string[]>([])
  let customDictionaryInput = $state('')
  let loadingCustomDictionary = $state(false)
  let customDictionaryBusy = $state(false)

  onMount(() => {
    void loadCustomDictionary()
  })

  async function loadCustomDictionary() {
    loadingCustomDictionary = true
    try {
      customDictionaryWords = await grammarService.getCustomWords()
    } catch (error) {
      console.error('[Interface] Failed to load custom dictionary:', error)
      ui.showToast($_('toast.failedToLoadDictionary'), 'error')
    } finally {
      loadingCustomDictionary = false
    }
  }

  async function handleAddCustomWord() {
    const input = customDictionaryInput
    if (!input.trim()) return

    customDictionaryBusy = true
    try {
      const result = await grammarService.addWord(input)
      if (result === 'added') {
        customDictionaryInput = ''
        customDictionaryWords = await grammarService.getCustomWords()
        ui.showToast($_('toast.wordAddedToDictionary'), 'info')
        return
      }

      if (result === 'exists') {
        ui.showToast($_('toast.wordAlreadyInDictionary'), 'warning')
        return
      }

      ui.showToast($_('toast.onlySingleWords'), 'warning')
    } catch (error) {
      console.error('[Interface] Failed to add custom dictionary word:', error)
      ui.showToast($_('toast.failedToAddWord'), 'error')
    } finally {
      customDictionaryBusy = false
    }
  }

  function handleCustomDictionaryInputKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return
    event.preventDefault()
    void handleAddCustomWord()
  }

  async function handleRemoveCustomWord(word: string) {
    customDictionaryBusy = true
    try {
      const result = await grammarService.removeWord(word)
      if (result === 'removed') {
        customDictionaryWords = await grammarService.getCustomWords()
        return
      }

      if (result === 'not_found') {
        customDictionaryWords = await grammarService.getCustomWords()
        ui.showToast($_('toast.wordNotFoundInDictionary'), 'warning')
        return
      }

      ui.showToast('Invalid dictionary word', 'warning')
    } catch (error) {
      console.error('[Interface] Failed to remove custom dictionary word:', error)
      ui.showToast($_('toast.failedToRemoveWord'), 'error')
    } finally {
      customDictionaryBusy = false
    }
  }

  async function handleClearCustomDictionary() {
    if (customDictionaryWords.length === 0) return
    const confirmed = confirm($_('confirm.clearDictionary'))
    if (!confirmed) return

    customDictionaryBusy = true
    try {
      await grammarService.clearCustomWords()
      customDictionaryWords = []
      ui.showToast($_('toast.dictionaryCleared'), 'info')
    } catch (error) {
      console.error('[Interface] Failed to clear custom dictionary:', error)
      ui.showToast($_('toast.failedToClearDictionary'), 'error')
    } finally {
      customDictionaryBusy = false
    }
  }

  async function handleCheckForUpdates() {
    isCheckingUpdates = true
    updateMessage = null
    try {
      const info = await updaterService.checkForUpdates()
      if (info.available) {
        updateMessage = $_('interface.updateAvailable', { values: { version: info.version } })
      } else {
        updateMessage = $_('interface.upToDate')
      }
    } catch (error) {
      updateMessage = $_('interface.updateCheckFailed')
      console.error('[Interface] Update check failed:', error)
    } finally {
      isCheckingUpdates = false
    }
  }

  const fontSizes = [
    { value: 'small', labelKey: 'settings.small' },
    { value: 'medium', labelKey: 'settings.medium' },
    { value: 'large', labelKey: 'settings.large' },
  ] as const
</script>

<div class="space-y-4">
  <!-- Theme Selection -->
  <div>
    <Label class="mb-2 block">{$_('interface.theme')}</Label>
    <Select.Root
      type="single"
      value={settings.uiSettings.theme}
      onValueChange={(v) => settings.setTheme(v)}
    >
      <Select.Trigger class="h-10 w-full">
        {THEMES.find((t) => t.id === settings.uiSettings.theme)?.label ?? $_('common.select')}
      </Select.Trigger>
      <Select.Content>
        {#each THEMES as theme (theme.id)}
          <Select.Item value={theme.id} label={theme.label}>
            {theme.label}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
    <p class="text-muted-foreground mt-1 text-xs">
      {THEMES.find((t) => t.id === settings.uiSettings.theme)?.description ?? ''}
    </p>
  </div>

  <!-- Font Size -->
  <div>
    <Label class="mb-2 block">{$_('interface.fontSize')}</Label>
    <Select.Root
      type="single"
      value={settings.uiSettings.fontSize}
      onValueChange={(v) => settings.setFontSize(v as 'small' | 'medium' | 'large')}
    >
      <Select.Trigger class="h-10 w-full">
        {fontSizes.find((s) => s.value === settings.uiSettings.fontSize)?.labelKey
          ? $_(fontSizes.find((s) => s.value === settings.uiSettings.fontSize)?.labelKey ?? '')
          : $_('common.select')}
      </Select.Trigger>
      <Select.Content>
        {#each fontSizes as size (size.value)}
          <Select.Item value={size.value} label={$_(size.labelKey)}>
            {$_(size.labelKey)}
          </Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>

  <!-- Story Content Width -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label>{$_('interface.storyContentWidth')}</Label>
      <span class="text-muted-foreground text-sm">
        {STORY_WIDTH_OPTIONS[storyWidthIndex]?.label ?? 'Default'}
      </span>
    </div>
    <p class="text-muted-foreground text-xs">
      {$_('interface.storyContentWidthDescription')}
    </p>
    <Slider
      type="single"
      min={0}
      max={STORY_WIDTH_OPTIONS.length - 1}
      step={1}
      value={storyWidthIndex}
      onValueChange={(idx) => settings.setStoryMaxWidth(STORY_WIDTH_OPTIONS[idx].key)}
    />
    <div class="text-muted-foreground flex justify-between text-xs">
      <span>{STORY_WIDTH_OPTIONS[0].label}</span>
      <span>{STORY_WIDTH_OPTIONS[STORY_WIDTH_OPTIONS.length - 1].label}</span>
    </div>
  </div>

  <!-- Word Count Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.wordCount')}</Label>
      <p class="text-muted-foreground text-xs">
        {$_('interface.wordCountDescription')}
      </p>
    </div>
    <Switch
      checked={settings.uiSettings.showWordCount}
      onCheckedChange={(v) => {
        settings.uiSettings.showWordCount = v
        database.setSetting('show_word_count', v.toString())
      }}
    />
  </div>

  <!-- Spellcheck Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.spellcheck')}</Label>
      <p class="text-muted-foreground text-xs">{$_('interface.spellcheckDescription')}</p>
    </div>
    <Switch
      checked={settings.uiSettings.spellcheckEnabled}
      onCheckedChange={(v) => settings.setSpellcheckEnabled(v)}
    />
  </div>

  <!-- Custom Dictionary -->
  <div class="space-y-3 rounded-lg border p-3">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <Label>{$_('interface.customDictionary')}</Label>
        <p class="text-muted-foreground text-xs">
          {$_('interface.customDictionaryDescription')}
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onclick={handleClearCustomDictionary}
        disabled={customDictionaryBusy || customDictionaryWords.length === 0}
      >
        <Trash2 class="mr-1.5 h-3.5 w-3.5" />
        {$_('common.clearAll')}
      </Button>
    </div>

    <div class="flex gap-2">
      <Input
        placeholder={$_('interface.addCustomWord')}
        bind:value={customDictionaryInput}
        onkeydown={handleCustomDictionaryInputKeydown}
      />
      <Button
        variant="outline"
        size="icon"
        onclick={handleAddCustomWord}
        disabled={customDictionaryBusy || !customDictionaryInput.trim()}
        title={$_('interface.addCustomWordTitle')}
      >
        <Plus class="h-4 w-4" />
      </Button>
    </div>

    {#if loadingCustomDictionary}
      <p class="text-muted-foreground text-xs">{$_('interface.loadingDictionary')}</p>
    {:else if customDictionaryWords.length === 0}
      <p class="text-muted-foreground text-xs">{$_('interface.noCustomWords')}</p>
    {:else}
      <ScrollArea class="h-24 w-full rounded-md border">
        <div class="flex flex-wrap gap-1 p-2">
          {#each customDictionaryWords as word (word)}
            <Badge variant="secondary" class="gap-1 pr-1">
              <span class="max-w-36 truncate">{word}</span>
              <button
                class="hover:text-destructive text-muted-foreground p-0 transition-colors"
                onclick={() => handleRemoveCustomWord(word)}
                title={$_('interface.removeWord')}
                disabled={customDictionaryBusy}
              >
                <X class="h-3 w-3" />
              </button>
            </Badge>
          {/each}
        </div>
      </ScrollArea>
    {/if}
  </div>

  <!-- Suggestions Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.suggestions')}</Label>
      <p class="text-muted-foreground text-xs">
        {$_('interface.suggestionsDescription')}
      </p>
    </div>
    <Switch
      checked={!settings.uiSettings.disableSuggestions}
      onCheckedChange={(v) => settings.setDisableSuggestions(!v)}
    />
  </div>

  <!-- Action Prefixes Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.actionPrefixes')}</Label>
      <p class="text-muted-foreground text-xs">{$_('interface.actionPrefixesDescription')}</p>
    </div>
    <Switch
      checked={!settings.uiSettings.disableActionPrefixes}
      onCheckedChange={(v) => settings.setDisableActionPrefixes(!v)}
    />
  </div>

  <!-- Show Reasoning Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.reasoningBlock')}</Label>
      <p class="text-muted-foreground text-xs">{$_('interface.reasoningBlockDescription')}</p>
    </div>
    <Switch
      checked={settings.uiSettings.showReasoning}
      onCheckedChange={(v) => settings.setShowReasoning(v)}
    />
  </div>

  <!-- Auto Scroll Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.autoScroll')}</Label>
      <p class="text-muted-foreground text-xs">
        {$_('interface.autoScrollDescription')}
      </p>
    </div>
    <Switch
      checked={settings.uiSettings.autoScroll}
      onCheckedChange={(v) => settings.setAutoScroll(v)}
    />
  </div>

  <!-- Scroll to Top Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.floatingScrollToTop')}</Label>
      <p class="text-muted-foreground text-xs">
        {$_('interface.floatingScrollToTopDescription')}
      </p>
    </div>
    <Switch
      checked={settings.uiSettings.showScrollToTop}
      onCheckedChange={(v) => settings.setShowScrollToTop(v)}
    />
  </div>

  <!-- Scroll to Bottom Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('interface.floatingScrollToBottom')}</Label>
      <p class="text-muted-foreground text-xs">
        {$_('interface.floatingScrollToBottomDescription')}
      </p>
    </div>
    <Switch
      checked={settings.uiSettings.showScrollToBottom}
      onCheckedChange={(v) => settings.setShowScrollToBottom(v)}
    />
  </div>

  <!-- Translation Section -->
  <div class="space-y-3">
    <div class="flex items-center gap-2">
      <Languages class="text-muted-foreground h-4 w-4" />
      <Label class="text-base font-medium">{$_('interface.translation')}</Label>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <Label>{$_('interface.enableTranslation')}</Label>
        <p class="text-muted-foreground text-xs">
          {$_('interface.enableTranslationDescription')}
        </p>
      </div>
      <Switch
        checked={settings.translationSettings.enabled}
        onCheckedChange={(v) => {
          settings.translationSettings.enabled = v
          settings.saveTranslationSettings()
        }}
      />
    </div>

    {#if settings.translationSettings.enabled}
      <!-- Target Language -->
      <div>
        <Label class="mb-2 block">{$_('interface.targetLanguage')}</Label>
        <Select.Root
          type="single"
          value={settings.translationSettings.targetLanguage}
          onValueChange={(v) => {
            settings.translationSettings.targetLanguage = v
            settings.saveTranslationSettings()
          }}
        >
          <Select.Trigger class="h-10 w-full">
            {getSupportedLanguages().find(
              (l) => l.code === settings.translationSettings.targetLanguage,
            )?.name ?? $_('tts.selectLanguage')}
          </Select.Trigger>
          <Select.Content class="max-h-60">
            {#each getSupportedLanguages() as lang (lang.code)}
              <Select.Item value={lang.code} label={lang.name}>
                {lang.name}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
        <p class="text-muted-foreground mt-1 text-xs">{$_('tts.selectLanguage')}</p>
      </div>

      <!-- Translate Narration -->
      <div class="flex items-center justify-between">
        <div>
          <Label>{$_('interface.translateNarration')}</Label>
          <p class="text-muted-foreground text-xs">
            {$_('interface.translateNarrationDescription')}
          </p>
        </div>
        <Switch
          checked={settings.translationSettings.translateNarration}
          onCheckedChange={(v) => {
            settings.translationSettings.translateNarration = v
            settings.saveTranslationSettings()
          }}
        />
      </div>

      <!-- Translate User Input -->
      <div class="flex items-center justify-between">
        <div>
          <Label>{$_('interface.translateUserInput')}</Label>
          <p class="text-muted-foreground text-xs">
            {$_('interface.translateUserInputDescription')}
          </p>
        </div>
        <Switch
          checked={settings.translationSettings.translateUserInput}
          onCheckedChange={(v) => {
            settings.translationSettings.translateUserInput = v
            settings.saveTranslationSettings()
          }}
        />
      </div>

      <!-- Translate World State -->
      <div class="flex items-center justify-between">
        <div>
          <Label>{$_('interface.translateWorldState')}</Label>
          <p class="text-muted-foreground text-xs">
            {$_('interface.translateWorldStateDescription')}
          </p>
        </div>
        <Switch
          checked={settings.translationSettings.translateWorldState}
          onCheckedChange={(v) => {
            settings.translationSettings.translateWorldState = v
            settings.saveTranslationSettings()
          }}
        />
      </div>
    {/if}
  </div>

  <Separator class="my-4" />

  <!-- Updates Section -->
  <div class="space-y-4">
    <Label class="text-base font-medium">{$_('interface.updates')}</Label>

    <!-- Check for Updates Button -->
    <div class="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onclick={handleCheckForUpdates}
        disabled={isCheckingUpdates}
      >
        {#if isCheckingUpdates}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          {$_('common.checking')}
        {:else}
          <RefreshCw class="mr-2 h-4 w-4" />
          {$_('interface.checkForUpdates')}
        {/if}
      </Button>
      {#if updateMessage}
        <span class="text-muted-foreground text-sm">{updateMessage}</span>
      {/if}
    </div>

    <!-- Check on Startup Toggle -->
    <div class="flex items-center justify-between">
      <div>
        <Label>{$_('interface.checkOnStartup')}</Label>
        <p class="text-muted-foreground text-xs">
          {$_('interface.checkOnStartupDescription')}
        </p>
      </div>
      <Switch
        checked={settings.updateSettings.autoCheck}
        onCheckedChange={(v) => settings.setAutoCheck(v)}
      />
    </div>

    <!-- Auto-download Updates Toggle -->
    <div class="flex items-center justify-between">
      <div>
        <Label>{$_('interface.autoDownloadUpdates')}</Label>
        <p class="text-muted-foreground text-xs">
          {$_('interface.autoDownloadUpdatesDescription')}
        </p>
      </div>
      <Switch
        checked={settings.updateSettings.autoDownload}
        onCheckedChange={(v) => settings.setAutoDownload(v)}
      />
    </div>
  </div>
</div>
