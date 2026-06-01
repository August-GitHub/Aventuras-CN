<script lang="ts">
  import { slide } from 'svelte/transition'
  import { _ } from 'svelte-i18n'
  import { FileJson, Loader2, Check, Sparkles, PenTool, Book, X, ChevronDown } from 'lucide-svelte'
  import { Button } from '$lib/components/ui/button'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import { Textarea } from '$lib/components/ui/textarea'
  import * as Card from '$lib/components/ui/card'
  import * as ScrollArea from '$lib/components/ui/scroll-area'
  import { Badge } from '$lib/components/ui/badge'

  import type { StoryMode, POV, Tense } from '$lib/types'
  import type {
    ExpandedSetting,
    GeneratedOpening,
    GeneratedProtagonist,
  } from '$lib/services/ai/sdk'
  import type { Genre } from '$lib/services/ai/wizard'
  import { styleUserPlaceholders } from '../wizardTypes'

  interface Props {
    // State
    storyTitle: string
    openingGuidance: string
    generatedOpening: GeneratedOpening | null
    isGeneratingOpening: boolean
    isRefiningOpening: boolean
    isEditingOpening: boolean
    openingDraft: string
    openingError: string | null
    manualOpeningText: string

    // Card import
    cardImportedFirstMessage: string | null
    cardImportedAlternateGreetings: string[]
    selectedGreetingIndex: number

    // Story context for summary
    selectedMode: StoryMode
    selectedGenre: Genre
    customGenre: string
    selectedPOV: POV
    selectedTense: Tense
    expandedSetting: ExpandedSetting | null
    protagonist: GeneratedProtagonist | null
    importedEntriesCount: number

    // Handlers
    onTitleChange: (value: string) => void
    onGuidanceChange: (value: string) => void
    onSelectedGreetingChange: (index: number) => void
    onGenerateOpening: () => void
    onRefineOpening: () => void
    onStartEdit: () => void
    onCancelEdit: () => void
    onSaveEdit: () => void
    onDraftChange: (value: string) => void
    onUseCardOpening: () => void
    onClearCardOpening: () => void
    onManualOpeningChange: (value: string) => void
    onClearGenerated: () => void
  }

  let {
    storyTitle,
    openingGuidance,
    generatedOpening,
    isGeneratingOpening,
    isRefiningOpening,
    isEditingOpening,
    openingDraft,
    openingError,
    manualOpeningText,
    cardImportedFirstMessage,
    cardImportedAlternateGreetings,
    selectedGreetingIndex,
    selectedMode,
    selectedGenre,
    customGenre,
    selectedPOV,
    selectedTense,
    expandedSetting,
    protagonist,
    importedEntriesCount,
    onTitleChange,
    onGuidanceChange,
    onSelectedGreetingChange,
    onGenerateOpening,
    onRefineOpening,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDraftChange,
    onUseCardOpening,
    onClearCardOpening,
    onClearGenerated,
    onManualOpeningChange,
  }: Props = $props()

  let altOpeningLabels = $derived(cardImportedAlternateGreetings.map((_, i) => `Alt ${i + 1}`))

  let showExpandOptions = $state(false)
</script>

<div class="space-y-4 p-1">
  <p class="text-muted-foreground">
    {$_('stepOpening.giveStoryTitle')}
  </p>

  <div class="space-y-2">
    <Label>{$_('settings.storyTitle')}</Label>
    <Input
      type="text"
      value={storyTitle}
      oninput={(e) => onTitleChange(e.currentTarget.value)}
      placeholder={$_('stepOpening.titlePlaceholder')}
    />
  </div>

  <!-- Imported Opening Scene from Character Card -->
  {#if cardImportedFirstMessage}
    <Card.Root class="bg-surface-800/50 border-surface-700">
      <Card.Content class="space-y-3 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <FileJson class="text-accent-400 h-4 w-4" />
            <h4 class="text-foreground font-medium">{$_('settings.importedOpeningScene')}</h4>
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="text-muted-foreground hover:text-foreground h-auto p-0 text-xs"
            onclick={onClearCardOpening}
          >
            {$_('stepOpening.clear')}
          </Button>
        </div>

        <!-- Greeting Selection (if alternate greetings exist) -->
        {#if cardImportedAlternateGreetings.length > 0}
          <div>
            <Label class="text-muted-foreground mb-2 block text-xs font-medium"
              >{$_('stepOpening.selectOpening')}</Label
            >
            <div class="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selectedGreetingIndex === 0 ? 'default' : 'secondary'}
                class="h-7 text-xs"
                onclick={() => onSelectedGreetingChange(0)}
              >
                {$_('stepOpening.defaultOpening')}
              </Button>
              {#each cardImportedAlternateGreetings as _, i (i)}
                <Button
                  size="sm"
                  variant={selectedGreetingIndex === i + 1 ? 'default' : 'secondary'}
                  class="h-7 text-xs"
                  onclick={() => onSelectedGreetingChange(i + 1)}
                >
                  {altOpeningLabels[i]}
                </Button>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Preview of selected opening -->
        <Card.Root class="bg-surface-900 border-none">
          <Card.Content class="p-3">
            <ScrollArea.Root class="h-48">
              <div class="text-muted-foreground text-sm whitespace-pre-wrap">
                {@html styleUserPlaceholders(
                  selectedGreetingIndex === 0
                    ? cardImportedFirstMessage || ''
                    : cardImportedAlternateGreetings[selectedGreetingIndex - 1] || '',
                )}
              </div>
            </ScrollArea.Root>
          </Card.Content>
        </Card.Root>

        {#if (selectedGreetingIndex === 0 ? cardImportedFirstMessage : cardImportedAlternateGreetings[selectedGreetingIndex - 1])?.includes('{{user}}')}
          <p class="text-muted-foreground flex items-center gap-1 text-xs">
            <Badge
              variant="outline"
              class="bg-primary/20 text-primary border-primary/30 rounded px-1 py-0.5 font-mono text-[10px]"
            >
              {'{{user}}'}
            </Badge>
            {$_('stepOpening.userPlaceholderReplaced')}
          </p>
        {/if}

        <Button size="sm" class="gap-2" onclick={onUseCardOpening}>
          <Check class="h-3 w-3" />
          {$_('stepOpening.useThisOpening')}
        </Button>
      </Card.Content>
    </Card.Root>
  {/if}

  <!-- Manual Opening Entry or AI Generation -->
  {#if storyTitle.trim()}
    <Card.Root class="bg-surface-900 border-surface-700">
      <Card.Content class="space-y-3 p-4">
        <h4 class="text-foreground font-medium">{$_('settings.openingScene')}</h4>
        <p class="text-muted-foreground text-sm">
          {$_('stepOpening.writeYourOwnScene')}
        </p>

        <!-- Manual Text Entry -->
        <div class="space-y-2">
          <Label>{$_('settings.writeYourOwnOpening')}</Label>
          <Textarea
            value={manualOpeningText}
            oninput={(e) => onManualOpeningChange(e.currentTarget.value)}
            placeholder={$_('stepOpening.openingPlaceholder')}
            class="min-h-[140px] resize-y text-sm"
            rows={6}
            disabled={isGeneratingOpening || isRefiningOpening || generatedOpening !== null}
          />
          {#if generatedOpening}
            <p class="text-xs text-amber-400">
              {$_('stepOpening.aiOpeningActive')}
            </p>
          {:else if manualOpeningText.trim()}
            <p class="text-xs text-green-400">✓ {$_('stepOpening.customOpeningReady')}</p>
          {/if}
        </div>

        <!-- Expand with AI -->
        <div class="flex items-center gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            class="text-muted-foreground gap-2"
            onclick={() => (showExpandOptions = !showExpandOptions)}
          >
            <Sparkles class="h-3.5 w-3.5" />
            {showExpandOptions ? $_('stepOpening.hideAiOptions') : $_('stepOpening.expandWithAi')}
            <ChevronDown
              class="h-3 w-3 transition-transform {showExpandOptions ? 'rotate-180' : ''}"
            />
          </Button>
        </div>

        <!-- AI Expansion Panel -->
        {#if showExpandOptions}
          <div
            class="text-card-foreground bg-muted/10 space-y-3 rounded-lg border px-3 pt-1 pb-3 shadow-sm"
            transition:slide={{ duration: 150 }}
          >
            <div class="space-y-1.5">
              <Label for="opening-ai-guidance" class="text-xs"
                >{$_('stepOpening.aiGuidanceOptional')}</Label
              >
              <Textarea
                id="opening-ai-guidance"
                value={openingGuidance}
                oninput={(e) => onGuidanceChange(e.currentTarget.value)}
                placeholder={$_('stepOpening.guidancePlaceholder')}
                class="mt-1 h-16 resize-none text-sm"
              />
            </div>
            <div class="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                class="w-full gap-2"
                onclick={onGenerateOpening}
                disabled={isGeneratingOpening || isRefiningOpening}
              >
                {#if isGeneratingOpening}
                  <Loader2 class="h-3.5 w-3.5 animate-spin" />
                  {$_('stepOpening.generating')}
                {:else}
                  <Sparkles class="h-3.5 w-3.5" />
                  {generatedOpening
                    ? $_('stepOpening.regenerateOpening')
                    : $_('stepOpening.generateOpeningWithAi')}
                {/if}
              </Button>
              {#if generatedOpening}
                <Button
                  variant="secondary"
                  size="icon"
                  class="shrink-0"
                  onclick={onClearGenerated}
                  title={$_('stepOpening.clearAiGeneratedTitle')}
                >
                  <X class="h-4 w-4" />
                </Button>
              {/if}
            </div>
          </div>
        {/if}

        {#if !generatedOpening && !isGeneratingOpening && !manualOpeningText.trim() && !cardImportedFirstMessage}
          <span class="text-center text-sm text-amber-400">
            {$_('stepOpening.eitherWriteOrGenerate')}
          </span>
        {/if}
      </Card.Content>
    </Card.Root>
  {:else}
    <p class="text-muted-foreground -mt-3 text-sm">{$_('stepOpening.enterTitleToContinue')}</p>
  {/if}

  {#if openingError}
    <p class="text-sm text-red-400">{openingError}</p>
  {/if}

  {#if generatedOpening}
    <Card.Root class="bg-surface-900 border-surface-700">
      <Card.Content class="space-y-3 p-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="text-foreground font-semibold">
            {generatedOpening?.title || storyTitle}
          </h3>
          {#if !isEditingOpening}
            <div class="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                class="text-muted-foreground hover:text-foreground h-auto gap-1 px-2 py-1 text-xs"
                onclick={onStartEdit}
                title={$_('stepOpening.editOpeningTitle')}
              >
                <PenTool class="h-3 w-3" />
                {$_('stepOpening.editOpening')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                class="text-accent-400 hover:text-accent-300 hover:bg-accent-950/20 h-auto gap-1 px-2 py-1 text-xs"
                onclick={onRefineOpening}
                disabled={isRefiningOpening || isGeneratingOpening}
                title={$_('stepOpening.refineOpeningTitle')}
              >
                {#if isRefiningOpening}
                  <Loader2 class="h-3 w-3 animate-spin" />
                  {$_('stepOpening.refining')}
                {:else}
                  <Sparkles class="h-3 w-3" />
                  {$_('stepOpening.refineFurther')}
                {/if}
              </Button>
            </div>
          {/if}
        </div>
        {#if isEditingOpening}
          <Textarea
            value={openingDraft ?? ''}
            oninput={(e) => onDraftChange(e.currentTarget.value)}
            class="min-h-[140px] resize-y text-sm"
            rows={6}
          />
          <div class="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onclick={onCancelEdit}
              >{$_('stepOpening.cancel')}</Button
            >
            <Button size="sm" onclick={onSaveEdit} disabled={!openingDraft?.trim()}>
              {$_('stepOpening.saveChanges')}
            </Button>
          </div>
        {:else}
          <ScrollArea.Root class="h-64">
            <div class="prose prose-invert prose-sm max-w-none">
              <p class="text-muted-foreground whitespace-pre-wrap">
                {generatedOpening?.scene || ''}
              </p>
            </div>
          </ScrollArea.Root>
        {/if}
      </Card.Content>
    </Card.Root>
  {/if}

  <!-- Summary -->
  <Card.Root class="bg-surface-800 border-surface-700">
    <Card.Content class="space-y-2 p-4 text-sm">
      <h4 class="text-foreground font-medium">{$_('settings.storySummary')}</h4>
      <div class="text-muted-foreground grid grid-cols-2 gap-2">
        <div>
          <strong class="text-foreground">{$_('stepOpening.mode')}</strong>
          {selectedMode === 'adventure'
            ? $_('stepOpening.adventure')
            : $_('stepOpening.creativeWriting')}
        </div>
        <div>
          <strong class="text-foreground">{$_('stepOpening.genre')}</strong>
          {selectedGenre === 'custom' ? customGenre : selectedGenre}
        </div>
        <div>
          <strong class="text-foreground">{$_('stepOpening.pov')}</strong>
          {selectedPOV === 'first'
            ? $_('stepOpening.pov1st')
            : selectedPOV === 'second'
              ? $_('stepOpening.pov2nd')
              : $_('stepOpening.pov3rd')}
        </div>
        <div>
          <strong class="text-foreground">{$_('stepOpening.tense')}</strong>
          {selectedTense === 'present'
            ? $_('stepOpening.tensePresent')
            : $_('stepOpening.tensePast')}
        </div>
        {#if expandedSetting}
          <div class="col-span-2">
            <strong class="text-foreground">{$_('stepOpening.setting')}</strong>
            {expandedSetting.name}
          </div>
        {/if}
        {#if protagonist}
          <div class="col-span-2">
            <strong class="text-foreground">{$_('stepOpening.protagonist')}</strong>
            {protagonist.name}
          </div>
        {/if}
        {#if importedEntriesCount > 0}
          <div class="col-span-2 flex items-center gap-2">
            <Book class="text-accent-400 h-4 w-4" />
            <strong class="text-foreground">{$_('stepOpening.lorebook')}</strong>
            {$_('stepOpening.entriesToImport', { values: { count: importedEntriesCount } })}
          </div>
        {/if}
      </div>
    </Card.Content>
  </Card.Root>
</div>
