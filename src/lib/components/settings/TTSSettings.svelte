<script lang="ts">
  import { _ } from 'svelte-i18n'
  import { settings } from '$lib/stores/settings.svelte'
  import { Switch } from '$lib/components/ui/switch'
  import { Label } from '$lib/components/ui/label'
  import { Input } from '$lib/components/ui/input'
  import { Button } from '$lib/components/ui/button'
  import * as Select from '$lib/components/ui/select'
  import { Slider } from '$lib/components/ui/slider'
  import { Play, Square, RefreshCw, Loader2 } from 'lucide-svelte'
  import { GOOGLE_TRANSLATE_LANGUAGES, aiTTSService } from '$lib/services/ai/utils'

  const PREVIEW_TEXT =
    'This is a preview of the selected voice. The story narration will sound like this.'

  let isPlayingPreview = $state(false)
  let isLoadingPreview = $state(false)
  let previewError = $state<string | null>(null)
  interface SystemVoice {
    name: string
    lang: string
  }

  let systemVoices = $state<SystemVoice[]>([])
  let isLoadingVoices = $state(false)

  /**
   * Load system voices when Microsoft provider is selected
   * Uses the TTS service to ensure consistent voice handling
   */
  async function loadSystemVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return
    }

    isLoadingVoices = true

    try {
      // Initialize the service to get properly formatted voices
      await aiTTSService.initialize({
        ...settings.systemServicesSettings.tts,
        provider: 'microsoft',
      })

      const voices = await aiTTSService.getAvailableVoices()
      systemVoices = voices.map((v) => ({ name: v.name, lang: v.lang }))
    } catch (error) {
      console.error('[TTSSettings] Failed to load system voices:', error)
      systemVoices = []
    } finally {
      isLoadingVoices = false
    }
  }

  // Load voices when provider changes to microsoft
  $effect(() => {
    if (settings.systemServicesSettings.tts.provider === 'microsoft') {
      loadSystemVoices()
    }
  })

  const providers = $derived([
    { value: 'openai' as const, label: $_('settings.openaiCompatible') },
    { value: 'google' as const, label: $_('settings.googleTranslate') },
    { value: 'microsoft' as const, label: $_('settings.windowsSystemTts') },
  ])

  /**
   * Validate TTS settings before preview
   */
  function validateTTSSettings(): string | null {
    const tts = settings.systemServicesSettings.tts

    if (tts.provider === 'openai') {
      if (!tts.endpoint || !tts.apiKey) {
        return $_('settings.endpointAndApiKeyRequired')
      }
    } else if (tts.provider === 'microsoft') {
      if (!tts.voice) {
        return $_('settings.pleaseSelectSystemVoice')
      }
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return $_('settings.speechSynthesisNotAvailable')
      }
      if (systemVoices.length > 0 && !systemVoices.some((v) => v.name === tts.voice)) {
        return $_('settings.voiceNotFound', { values: { voice: tts.voice } })
      }
    }
    return null
  }

  async function playVoicePreview() {
    if (!settings.systemServicesSettings.tts.enabled || isPlayingPreview || isLoadingPreview) {
      return
    }

    const validationError = validateTTSSettings()
    if (validationError) {
      previewError = validationError
      return
    }

    const tts = settings.systemServicesSettings.tts

    isLoadingPreview = true
    previewError = null

    try {
      await aiTTSService.initialize(tts)

      isPlayingPreview = true
      isLoadingPreview = false

      await aiTTSService.generateAndPlay(PREVIEW_TEXT, tts.voice)

      isPlayingPreview = false
    } catch (error) {
      console.error('[TTSSettings] Preview failed:', error)
      previewError = error instanceof Error ? error.message : $_('settings.previewFailed')
      isPlayingPreview = false
      isLoadingPreview = false
    }
  }

  function stopPreview() {
    aiTTSService.stopPlayback()
    isPlayingPreview = false
    isLoadingPreview = false
  }

  function resetSettings() {
    settings.resetTTSSettings()
    previewError = null
  }
</script>

<div class="space-y-4">
  <!-- Enable TTS Toggle -->
  <div class="flex items-center justify-between">
    <div>
      <Label>{$_('settings.enableTextToSpeech')}</Label>
      <p class="text-muted-foreground text-xs">{$_('settings.configureTextToSpeech')}</p>
    </div>
    <Switch
      checked={settings.systemServicesSettings.tts.enabled}
      onCheckedChange={(v) => {
        settings.systemServicesSettings.tts.enabled = v
        settings.saveSystemServicesSettings()
      }}
    />
  </div>

  {#if settings.systemServicesSettings.tts.enabled}
    <!-- Provider Selection -->
    <div>
      <Label class="mb-2 block">{$_('settings.ttsProvider')}</Label>
      <Select.Root
        type="single"
        value={settings.systemServicesSettings.tts.provider}
        onValueChange={(v) => {
          const provider = v as 'openai' | 'google' | 'microsoft'
          const tts = settings.systemServicesSettings.tts

          // Save current voice to provider-specific slot
          if (tts.providerVoices) {
            tts.providerVoices[tts.provider] = tts.voice
          }

          tts.provider = provider

          // Restore provider-specific voice
          if (tts.providerVoices?.[provider]) {
            tts.voice = tts.providerVoices[provider]
          } else {
            // Fallbacks if not initialized
            if (provider === 'openai') tts.voice = 'alloy'
            else if (provider === 'google') tts.voice = 'en'
            else if (provider === 'microsoft') tts.voice = '' // Will be set when user selects from dropdown
          }

          // Ensure google voice is valid
          if (
            provider === 'google' &&
            !GOOGLE_TRANSLATE_LANGUAGES.some((lang) => lang.id === tts.voice)
          ) {
            tts.voice = 'en'
            if (tts.providerVoices) tts.providerVoices['google'] = 'en'
          }

          settings.saveSystemServicesSettings()
        }}
      >
        <Select.Trigger class="h-10 w-full">
          {providers.find((p) => p.value === settings.systemServicesSettings.tts.provider)?.label ??
            $_('settings.selectProvider')}
        </Select.Trigger>
        <Select.Content portalProps={{ disabled: true }}>
          {#each providers as provider (provider.value)}
            <Select.Item value={provider.value} label={provider.label}>
              {provider.label}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>

    {#if settings.systemServicesSettings.tts.provider === 'openai'}
      <!-- API Endpoint -->
      <div>
        <Label class="mb-2 block">{$_('settings.apiEndpoint')}</Label>
        <Input
          type="text"
          class="w-full"
          value={settings.systemServicesSettings.tts.endpoint}
          oninput={(e) => {
            settings.systemServicesSettings.tts.endpoint = e.currentTarget.value
            settings.saveSystemServicesSettings()
          }}
          placeholder="https://api.openai.com/v1/audio/speech"
        />
      </div>

      <!-- API Key -->
      <div>
        <Label class="mb-2 block">{$_('settings.apiKey')}</Label>
        <Input
          type="password"
          class="w-full"
          value={settings.systemServicesSettings.tts.apiKey}
          oninput={(e) => {
            settings.systemServicesSettings.tts.apiKey = e.currentTarget.value
            settings.saveSystemServicesSettings()
          }}
          placeholder={$_('settings.enterApiKey')}
        />
      </div>

      <!-- TTS Model -->
      <div>
        <Label class="mb-2 block">{$_('settings.ttsModel')}</Label>
        <Input
          type="text"
          class="w-full"
          value={settings.systemServicesSettings.tts.model}
          oninput={(e) => {
            settings.systemServicesSettings.tts.model = e.currentTarget.value
            settings.saveSystemServicesSettings()
          }}
          placeholder="tts-1"
        />
      </div>

      <!-- Voice -->
      <div>
        <Label class="mb-2 block">{$_('settings.voice')}</Label>
        <Input
          type="text"
          class="w-full"
          value={settings.systemServicesSettings.tts.voice}
          oninput={(e) => {
            const voice = e.currentTarget.value
            settings.systemServicesSettings.tts.voice = voice
            if (settings.systemServicesSettings.tts.providerVoices) {
              settings.systemServicesSettings.tts.providerVoices['openai'] = voice
            }
            settings.saveSystemServicesSettings()
          }}
          placeholder="alloy"
        />
      </div>
    {:else if settings.systemServicesSettings.tts.provider === 'microsoft'}
      <!-- Windows System Voice Selection -->
      <div>
        <Label class="mb-2 block">{$_('settings.systemVoice')}</Label>
        {#if isLoadingVoices}
          <div class="text-muted-foreground flex items-center gap-2 text-sm">
            <Loader2 class="h-4 w-4 animate-spin" />
            {$_('settings.loadingSystemVoices')}
          </div>
        {:else if systemVoices.length === 0}
          <div class="text-muted-foreground text-sm">
            {$_('settings.noSystemVoicesFound')}
          </div>
        {:else}
          <Select.Root
            type="single"
            value={settings.systemServicesSettings.tts.voice}
            onValueChange={(v) => {
              settings.systemServicesSettings.tts.voice = v
              if (settings.systemServicesSettings.tts.providerVoices) {
                settings.systemServicesSettings.tts.providerVoices['microsoft'] = v
              }
              settings.saveSystemServicesSettings()
            }}
          >
            <Select.Trigger class="h-10 w-full">
              {systemVoices.find((v) => v.name === settings.systemServicesSettings.tts.voice)
                ?.name ?? $_('settings.selectSystemVoice')}
            </Select.Trigger>
            <Select.Content portalProps={{ disabled: true }}>
              {#each systemVoices as voice (voice.name)}
                <Select.Item value={voice.name} label={voice.name}>
                  {voice.name}
                  <span class="text-muted-foreground ml-2 text-xs">({voice.lang})</span>
                </Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        {/if}
      </div>
    {:else if settings.systemServicesSettings.tts.provider === 'google'}
      <!-- Language Selection -->
      <div>
        <Label class="mb-2 block">{$_('settings.language')}</Label>
        <Select.Root
          type="single"
          value={settings.systemServicesSettings.tts.voice}
          onValueChange={(v) => {
            settings.systemServicesSettings.tts.voice = v
            if (settings.systemServicesSettings.tts.providerVoices) {
              settings.systemServicesSettings.tts.providerVoices['google'] = v
            }
            settings.saveSystemServicesSettings()
          }}
        >
          <Select.Trigger class="h-10 w-full">
            {GOOGLE_TRANSLATE_LANGUAGES.find(
              (l) => l.id === settings.systemServicesSettings.tts.voice,
            )?.name ?? $_('settings.selectLanguage')}
          </Select.Trigger>
          <Select.Content portalProps={{ disabled: true }}>
            {#each GOOGLE_TRANSLATE_LANGUAGES as lang (lang.id)}
              <Select.Item value={lang.id} label={lang.name}>
                {lang.name}
              </Select.Item>
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
    {/if}

    <!-- Voice Preview -->
    <div>
      <Button
        variant="outline"
        class="w-full"
        onclick={isPlayingPreview ? stopPreview : playVoicePreview}
        disabled={isLoadingPreview}
      >
        {#if isLoadingPreview}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          {$_('common.loading')}
        {:else if isPlayingPreview}
          <Square class="mr-2 h-4 w-4" />
          {$_('tts.stopPreview')}
        {:else}
          <Play class="mr-2 h-4 w-4" />
          {$_('settings.previewVoice')}
        {/if}
      </Button>
      {#if previewError}
        <p class="text-destructive mt-2 text-xs">{previewError}</p>
      {/if}
    </div>

    <!-- Volume Control -->
    <div class="border-border bg-muted/20 space-y-4 rounded-lg border p-4">
      <div class="flex items-center justify-between">
        <div>
          <Label>{$_('settings.volumeOverride')}</Label>
          <p class="text-muted-foreground text-xs">{$_('settings.manuallyControlVolume')}</p>
        </div>
        <Switch
          checked={settings.systemServicesSettings.tts.volumeOverride}
          onCheckedChange={(v) => {
            settings.systemServicesSettings.tts.volumeOverride = v
            settings.saveSystemServicesSettings()
          }}
        />
      </div>

      {#if settings.systemServicesSettings.tts.volumeOverride}
        <div>
          <Label class="mb-2 block">
            {$_('settings.narrationVolume', { values: { value: Math.round(settings.systemServicesSettings.tts.volume * 100) } })}
          </Label>
          <Slider
            value={settings.systemServicesSettings.tts.volume}
            onValueChange={(v) => {
              settings.systemServicesSettings.tts.volume = v
              settings.saveSystemServicesSettings()
            }}
            type="single"
            min={0}
            max={1}
            step={0.01}
            class="w-full"
          />
        </div>
      {/if}
    </div>

    <!-- Speech Speed -->
    <div>
      <Label class="mb-2 block">
        {$_('settings.speechSpeed', { values: { value: settings.systemServicesSettings.tts.speed.toFixed(2) } })}
      </Label>
      <Slider
        value={settings.systemServicesSettings.tts.speed}
        onValueChange={(v) => {
          settings.systemServicesSettings.tts.speed = v
          settings.saveSystemServicesSettings()
        }}
        type="single"
        min={0.25}
        max={4}
        step={0.05}
        class="w-full"
      />
      <p class="text-muted-foreground mt-1 text-xs">
        {$_('settings.adjustSpeechSpeed')}
      </p>
    </div>

    <!-- Auto-Play Toggle -->
    <div class="flex items-center justify-between">
      <div>
        <Label>{$_('settings.autoPlayNarration')}</Label>
        <p class="text-muted-foreground text-xs">
          {$_('settings.automaticallyPlayWhenStory')}
        </p>
      </div>
      <Switch
        checked={settings.systemServicesSettings.tts.autoPlay}
        onCheckedChange={(v) => {
          settings.systemServicesSettings.tts.autoPlay = v
          settings.saveSystemServicesSettings()
        }}
      />
    </div>

    <!-- Excluded Characters -->
    <div>
      <Label class="mb-2 block">{$_('settings.excludedCharacters')}</Label>
      <Input
        type="text"
        class="w-full"
        value={settings.systemServicesSettings.tts.excludedCharacters}
        oninput={(e) => {
          settings.systemServicesSettings.tts.excludedCharacters = e.currentTarget.value
          settings.saveSystemServicesSettings()
        }}
        placeholder={$_('settings.enterExcludedCharacters')}
      />
      <p class="text-muted-foreground mt-1 text-xs">{$_('settings.charactersExcludedFromTts')}</p>
    </div>
    <div class="border-border bg-muted/20 space-y-4 rounded-lg border p-4">
      <!-- Remove HTML tags Toggle -->
      <div class="flex items-center justify-between">
        <div>
          <Label>{$_('settings.removeHtmlTags')}</Label>
          <p class="text-muted-foreground text-xs">
            {$_('settings.removeHtmlFromNarratedText')}
          </p>
        </div>
        <Switch
          checked={settings.systemServicesSettings.tts.removeHtmlTags}
          onCheckedChange={(v) => {
            settings.systemServicesSettings.tts.removeHtmlTags = v
            settings.saveSystemServicesSettings()
          }}
        />
      </div>

      {#if settings.systemServicesSettings.tts.removeHtmlTags}
        <!-- HTML tags to remove content from -->
        <div>
          <Label class="mb-2 block">{$_('settings.htmlTagsToRemoveContent')}</Label>
          <Input
            type="text"
            class="w-full"
            value={settings.systemServicesSettings.tts.htmlTagsToRemoveContent}
            oninput={(e) => {
              settings.systemServicesSettings.tts.htmlTagsToRemoveContent = e.currentTarget.value
              settings.saveSystemServicesSettings()
            }}
            placeholder={$_('settings.commaSeparatedHtmlTags')}
            disabled={settings.systemServicesSettings.tts.removeAllHtmlContent}
          />
          <p class="text-muted-foreground mt-1 text-xs">
            {$_('tts.htmlTagContentDescription')}
          </p>
        </div>

        <!-- Remove all tag content Toggle -->
        <div class="flex items-center justify-between">
          <div>
            <Label>{$_('settings.removeAllTagContent')}</Label>
            <p class="text-muted-foreground text-xs">
              {$_('settings.removesContentInsideTags')}
            </p>
          </div>
          <Switch
            checked={settings.systemServicesSettings.tts.removeAllHtmlContent}
            onCheckedChange={(v) => {
              settings.systemServicesSettings.tts.removeAllHtmlContent = v
              settings.saveSystemServicesSettings()
            }}
          />
        </div>
      {/if}
    </div>
    <!-- Reset Button -->
    <Button variant="outline" size="sm" onclick={resetSettings}>
      <RefreshCw class="mr-1 h-3 w-3" />
      {$_('settings.resetToDefaults')}
    </Button>
  {/if}
</div>
