<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'

const filters = reactive({
  material: '10000293',
  plant: '1010',
  targetWarehouse: '404I',
  targetQuantity: '20'
})

const aiRecommendations = ref([
  {
    key: 'row-1',
    priority: 1,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '402G',
    storageName: 'Nanchang After-sales Warehouse',
    availableQuantity: '20 EA',
    road: '639',
    roadUnit: 'KM',
    reason:
      'Primary recommendation: after-sales warehouse + stock meets target + lead time 58h (shortest among candidates) + low cost.'
  },
  {
    key: 'row-2',
    priority: 2,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '406K',
    storageName: 'Guiyang After-sales Warehouse',
    availableQuantity: '50 EA',
    road: '333',
    roadUnit: 'KM',
    reason:
      'Alternative recommendation: after-sales warehouse + stock meets target + lead time 76h (second shortest among candidates).'
  },
  {
    key: 'row-3',
    priority: 3,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '202B',
    storageName: 'Beijing Warehouse',
    availableQuantity: '2000 EA',
    road: '573',
    roadUnit: 'KM',
    reason:
      'Secondary alternative: regular warehouse + stock meets target + shortest lead time (across all warehouses) + low cost.'
  },
  {
    key: 'row-4',
    priority: 4,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '201A',
    storageName: 'Shanghai Warehouse',
    availableQuantity: '1000 EA',
    road: '102',
    roadUnit: 'KM',
    reason:
      'Secondary alternative: regular warehouse + stock meets target + lead time 55h.'
  },
  {
    key: 'row-5',
    priority: 5,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '204D',
    storageName: 'Guangzhou Warehouse',
    availableQuantity: '1600 EA',
    road: '705',
    roadUnit: 'KM',
    reason:
      'Secondary alternative: regular warehouse + stock meets target + lead time 58h.'
  },
  {
    key: 'row-6',
    priority: 6,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '203C',
    storageName: 'Shenzhen Warehouse',
    availableQuantity: '1800 EA',
    road: '300',
    roadUnit: 'KM',
    reason:
      'Secondary alternative: regular warehouse + stock meets target + lead time 58h (same as Shenzhen) + lower cost.'
  },
  {
    key: 'row-7',
    priority: 7,
    available: true,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '205E',
    storageName: 'Chongqing Warehouse',
    availableQuantity: '800 EA',
    road: '509',
    roadUnit: 'KM',
    reason:
      'Secondary alternative: regular warehouse + stock meets target + longest lead time (76h).'
  },
  {
    key: 'row-8',
    priority: null,
    available: false,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '401F',
    storageName: 'Nanjing After-sales Warehouse',
    availableQuantity: '10 EA',
    road: '264',
    roadUnit: 'KM',
    reason:
      'Not recommended: after-sales warehouse + lead time 54h (second shortest vs 52h) + insufficient stock.'
  },
  {
    key: 'row-9',
    priority: null,
    available: false,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '403H',
    storageName: 'Luoyang After-sales Warehouse',
    availableQuantity: '12 EA',
    road: '651',
    roadUnit: 'KM',
    reason:
      'Not recommended: after-sales warehouse + lead time 52h (shortest among after-sales warehouses) + low cost but insufficient stock.'
  },
  {
    key: 'row-10',
    priority: null,
    available: false,
    materialCode: '10000293',
    materialDescription: 'Centrifugal pump impeller assembly',
    companyCode: '1000',
    companyName: 'BestRun CN',
    plantCode: '1010',
    plantName: 'Plant 1010',
    storageCode: '405J',
    storageName: 'Hefei After-sales Warehouse',
    availableQuantity: '8 EA',
    road: '431',
    roadUnit: 'KM',
    reason:
      'Not recommended: after-sales warehouse + lead time 52h (same as Luoyang) + higher cost than Luoyang and insufficient stock.'
  }
])

const aiRuleDialogRef = ref(null)
const confirmDialogRef = ref(null)
const emailDialogRef = ref(null)
const toastRef = ref(null)

const toastMessage = ref('')
const selectedKeys = ref([])

const confirmForm = reactive({
  material: '',
  plant: '',
  targetWarehouse: '',
  sourceWarehouse: '',
  quantity: '',
  date: new Date().toISOString().split('T')[0]
})

const emailContent = ref('')
const transferOrderNumber = ref('4820000011')

const emailForm = reactive({
  sender: 'scm-notify@joule.com',
  to: 'warehouse.team@joule.com',
  cc: 'supply-chain@joule.com',
  subject: ''
})

const defaultRules = Object.freeze([
  'Cannot transfer from the target warehouse.',
  'Prioritize transfers from warehouses with the shortest transit time.',
  'If transit time is equal, prioritize the warehouse with the lowest freight cost.'
])

const userPreferenceRules = ref([
  'Prefer transfers from after-sales warehouses.',
  'Transfer must be in a full batch; do not split across multiple warehouses.'
])

const isTableLoading = ref(true)
const isActionLoading = ref(false)
const actionLoadingMessage = ref('')

const selectedRows = computed(() =>
  aiRecommendations.value.filter((row) => selectedKeys.value.includes(row.key))
)

const wait = (ms = 900) => new Promise((resolve) => setTimeout(resolve, ms))

const runWithLoading = async (message, task, delay = 900) => {
  if (isActionLoading.value) {
    return
  }

  actionLoadingMessage.value = message
  isActionLoading.value = true

  try {
    await wait(delay)
    await task()
  } finally {
    actionLoadingMessage.value = ''
    isActionLoading.value = false
  }
}

const showToast = async (message) => {
  toastMessage.value = message
  await nextTick()
  const toast = toastRef.value
  if (!toast) {
    return
  }
  if (typeof toast.show === 'function') {
    toast.show()
  } else {
    toast.open = true
  }
}

const isRowSelected = (key) => selectedKeys.value.includes(key)

const toggleRowSelection = (key) => {
  if (isRowSelected(key)) {
    selectedKeys.value = selectedKeys.value.filter((selectedKey) => selectedKey !== key)
  } else {
    selectedKeys.value = [...selectedKeys.value, key]
  }
}

const onCheckboxChange = (key, event) => {
  event.stopPropagation()
  const shouldSelect = event.target?.checked
  if (shouldSelect) {
    if (!isRowSelected(key)) {
      selectedKeys.value = [...selectedKeys.value, key]
    }
  } else {
    selectedKeys.value = selectedKeys.value.filter((selectedKey) => selectedKey !== key)
  }
}

const onRowKeydown = (event, key) => {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault()
    toggleRowSelection(key)
  }
}

const openDialog = (dialogRef) => {
  const dialog = dialogRef.value
  if (!dialog) {
    return null
  }

  if (typeof dialog.show === 'function') {
    dialog.show()
  } else {
    dialog.open = true
  }

  return dialog
}

const closeDialog = (dialogRef) => {
  const dialog = dialogRef.value
  if (!dialog) {
    return
  }

  if (typeof dialog.close === 'function') {
    dialog.close()
  } else {
    dialog.open = false
  }
}

const openAiRuleDialog = () => {
  return runWithLoading('AI Agent is syncing rules...', () => {
    openDialog(aiRuleDialogRef)
  }, 850)
}

const onAiRuleAfterClose = () => {
  showToast('AI rules are ready.')
}

const buildEmailTemplate = () => {
  const first = selectedRows.value[0]
  const quantityText = confirmForm.quantity || first?.availableQuantity || '20 EA'
  const sourceText =
    confirmForm.sourceWarehouse ||
    [first?.storageCode, first?.storageName].filter(Boolean).join(' ') ||
    'Source warehouse'
  const rawTarget =
    confirmForm.targetWarehouse || `${filters.targetWarehouse} Shenyang After-sales Warehouse`
  const targetText = rawTarget.trim() || 'Shenyang After-sales Warehouse'
  const materialCode = confirmForm.material || first?.materialCode || '10000293'
  const requiredDate = confirmForm.date || '2025-11-18'

  return `Dear Supply Chain / Warehouse colleagues,

${targetText} is currently below the safety stock level for the centrifugal pump impeller assembly (material ${materialCode}) and cannot support upcoming after-sales work orders. I would like to request a transfer of ${quantityText} from ${sourceText} to ${targetText}. Please help to complete the goods receipt before ${requiredDate}. The system has already created transfer order ${transferOrderNumber.value}.

If you need additional justification or have any questions about inventory or logistics arrangements, please feel free to contact me.

Thank you for your support. Please confirm this request at your earliest convenience.`
}
const onTransferClick = () => {
  if (!selectedKeys.value.length) {
    showToast('Please select at least one row to transfer.')
    return
  }

  const first = selectedRows.value[0]
  confirmForm.material = first.materialCode
  confirmForm.plant = `${first.plantCode} ${first.plantName}`
  confirmForm.targetWarehouse = `${filters.targetWarehouse} Shenyang After-sales Warehouse`
  confirmForm.sourceWarehouse = `${first.storageCode} ${first.storageName}`
  confirmForm.quantity = first.availableQuantity
  confirmForm.date = '2025-11-18'

  return runWithLoading('AI Agent is generating a transfer proposal...', () => {
    openDialog(confirmDialogRef)
  }, 1000)
}

const onConfirmDialogApprove = () => {
  return runWithLoading('AI Agent is creating the transfer order...', () => {
    closeConfirmDialog()
    emailForm.subject = `Transfer order ${transferOrderNumber.value} notification: ${confirmForm.material}`
    emailContent.value = buildEmailTemplate()
    showToast(`Transfer order ${transferOrderNumber.value} has been created.`)
    openDialog(emailDialogRef)
  }, 1000)
}

const onEmailSend = () => {
  return runWithLoading('AI Agent is sending the notification email...', () => {
    closeEmailDialog()
    showToast('Transfer notification sent. Process completed ✅')
  }, 1100)
}

const onEmailCancel = () => {
  closeEmailDialog()
}

const priorityDisplay = (row) => {
  if (!row.available) {
    return { icon: 'status-error', label: null }
  }
  return {
    icon: null,
    label: row.priority ?? ''
  }
}

const handleFilterInput = (key) => (event) => {
  filters[key] = event.target.value
}

const handleConfirmInput = (key) => (event) => {
  confirmForm[key] = event.target.value
}

const onConfirmDateChange = (event) => {
  confirmForm.date = event.target.value
}

const onEmailInput = (event) => {
  emailContent.value = event.target.value
}

const handleEmailFormInput = (key) => (event) => {
  emailForm[key] = event.target.value
}

const onEditPreferences = () => {
  closeDialog(aiRuleDialogRef)
  showToast('Please update your preferences in Settings.')
}

const closeAiRuleDialog = () => {
  closeDialog(aiRuleDialogRef)
}

const closeConfirmDialog = () => {
  closeDialog(confirmDialogRef)
}

const closeEmailDialog = () => {
  closeDialog(emailDialogRef)
}

onMounted(() => {
  wait(1800).then(() => {
    isTableLoading.value = false
  })
})

const durationTooltipRef = ref(null)
const amountTooltipRef = ref(null)
const aiReasonTooltipRef = ref(null)

const showPopover = (popoverRef, target) => {
  const popover = popoverRef.value
  if (popover) {
    popover.opener = target
    popover.open = true
  }
}

const closePopover = (popoverRef) => {
  const popover = popoverRef.value
  if (popover) {
    popover.open = false
  }
}

const openDurationTooltip = (event) => {
  showPopover(durationTooltipRef, event.currentTarget)
}

const closeDurationTooltip = () => {
  closePopover(durationTooltipRef)
}

const openAmountTooltip = (event) => {
  showPopover(amountTooltipRef, event.currentTarget)
}

const closeAmountTooltip = () => {
  closePopover(amountTooltipRef)
}

const openAiReasonTooltip = (event) => {
  showPopover(aiReasonTooltipRef, event.currentTarget)
}

const closeAiReasonTooltip = () => {
  closePopover(aiReasonTooltipRef)
}
</script>

<template>
  <div class="page">
    <ui5-shellbar primary-title="Smart Inventory Transfer System" secondary-title="Inventory Transfer Assistant">
      <img slot="logo" src="/sap-logo.svg" alt="SAP logo" class="sap-logo" />
      <ui5-avatar slot="profile" icon="employee"></ui5-avatar>
    </ui5-shellbar>

    <main class="content">
      <section class="filter-card">
        <div class="card-title">Inventory Transfer Recommendations</div>
        <div class="filter-grid">
          <div class="field">
            <ui5-label for="material">Material</ui5-label>
            <ui5-input
              id="material"
              :value="filters.material"
              @input="handleFilterInput('material')"
            />
          </div>
          <div class="field">
            <ui5-label for="plant">Plant</ui5-label>
            <ui5-input id="plant" :value="filters.plant" @input="handleFilterInput('plant')" />
          </div>
          <div class="field">
            <ui5-label for="target-warehouse">Target Warehouse</ui5-label>
            <ui5-input
              id="target-warehouse"
              :value="filters.targetWarehouse"
              @input="handleFilterInput('targetWarehouse')"
            />
          </div>
          <div class="field">
            <ui5-label for="target-quantity">Target Quantity</ui5-label>
            <ui5-input
              id="target-quantity"
              :value="filters.targetQuantity"
              @input="handleFilterInput('targetQuantity')"
            />
          </div>
        </div>
        <div class="actions">
          <ui5-button design="Emphasized" icon="create">Search</ui5-button>
          <ui5-button design="Positive" icon="workflow-tasks" @click="onTransferClick">Transfer</ui5-button>
          <ui5-button design="Emphasized" icon="create">AI Suggestion</ui5-button>
          <ui5-button class="ai-rule-button" design="Transparent" @click="openAiRuleDialog">
            AI Rule
          </ui5-button>
        </div>
      </section>

      <section class="table-card wide">
        <div class="table-scroll">
          <div v-if="isTableLoading" class="table-loading">
            <ui5-busy-indicator size="Large" active></ui5-busy-indicator>
            <p>AI Agent is calculating in real time...</p>
          </div>
          <ui5-table v-else class="recommendation-table" mode="None">
            <ui5-table-header-row slot="headerRow">
              <ui5-table-header-cell width="68px" min-width="64px">Select</ui5-table-header-cell>
              <ui5-table-header-cell width="88px" min-width="82px">Priority</ui5-table-header-cell>
              <ui5-table-header-cell width="128px" min-width="112px">Material ID</ui5-table-header-cell>
              <ui5-table-header-cell width="130px" min-width="70px">Material Description</ui5-table-header-cell>
            <ui5-table-header-cell width="160px" min-width="140px">Company</ui5-table-header-cell>
            <ui5-table-header-cell width="130px" min-width="100px">Plant</ui5-table-header-cell>
            <ui5-table-header-cell width="130px" min-width="100px">Warehouse</ui5-table-header-cell>
            <ui5-table-header-cell width="100px" min-width="80px">Available Quantity</ui5-table-header-cell>
            <ui5-table-header-cell
              class="tooltip-cell"
              width="100px"
              min-width="80px"
            >
              <span
                class="header-label hover-label derived-label"
                tabindex="0"
                @mouseenter="openDurationTooltip"
                @mouseleave="closeDurationTooltip"
                @focusin="openDurationTooltip"
                @focusout="closeDurationTooltip"
                >Road</span
              >
            </ui5-table-header-cell>
            <ui5-table-header-cell
              class="tooltip-cell"
              width="100px"
              min-width="80px"
            >
              <span
                class="header-label hover-label derived-label"
                tabindex="0"
                @mouseenter="openAmountTooltip"
                @mouseleave="closeAmountTooltip"
                @focusin="openAmountTooltip"
                @focusout="closeAmountTooltip"
                >Road Unit</span
              >
            </ui5-table-header-cell>
            <ui5-table-header-cell
              class="tooltip-cell"
              width="300px"
              min-width="300px"
            >
              <div
                class="ai-header hover-label derived-label"
                tabindex="0"
                @mouseenter="openAiReasonTooltip"
                @mouseleave="closeAiReasonTooltip"
                @focusin="openAiReasonTooltip"
                @focusout="closeAiReasonTooltip"
              >
                <img src="/ai.svg?v=blue" alt="AI" class="ai-header-icon" />
                <span>AI Ranking Result</span>
              </div>
            </ui5-table-header-cell>
          </ui5-table-header-row>

          <ui5-table-row
            v-for="row in aiRecommendations"
            :key="row.key"
            class="table-row"
            :class="{ selected: isRowSelected(row.key) }"
            :data-key="row.key"
            tabindex="0"
            @click="toggleRowSelection(row.key)"
            @keydown.space.prevent="onRowKeydown($event, row.key)"
            @keydown.enter.prevent="onRowKeydown($event, row.key)"
          >
            <ui5-table-cell>
              <div class="selection-cell" @click.stop="toggleRowSelection(row.key)">
                <ui5-checkbox
                  class="row-checkbox"
                  :checked="isRowSelected(row.key)"
                  @change="onCheckboxChange(row.key, $event)"
                ></ui5-checkbox>
              </div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="priority-cell">
                <template v-if="priorityDisplay(row).icon">
                  <ui5-icon :name="priorityDisplay(row).icon" class="status-icon danger" />
                </template>
                <template v-else>
                  <span
                    class="priority-badge"
                    :class="{ warn: row.priority >= 3 && row.priority <= 7 }"
                    >{{ priorityDisplay(row).label }}</span
                  >
                </template>
              </div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell cell-strong">{{ row.materialCode }}</div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell ellipsis">{{ row.materialDescription }}</div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell dual-line">
                <span class="code">{{ row.companyCode }}</span>
                <span class="name">{{ row.companyName }}</span>
              </div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell dual-line">
                <span class="code">{{ row.plantCode }}</span>
                <span class="name">{{ row.plantName }}</span>
              </div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell dual-line">
                <span class="code">{{ row.storageCode }}</span>
                <span class="name">{{ row.storageName }}</span>
              </div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell">{{ row.availableQuantity }}</div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell">{{ row.road }}</div>
            </ui5-table-cell>
            <ui5-table-cell>
              <div class="cell">{{ row.roadUnit }}</div>
            </ui5-table-cell>
            <ui5-table-cell class="ai-reason-cell">
              <div class="cell ai-text">{{ row.reason }}</div>
            </ui5-table-cell>
            </ui5-table-row>
          </ui5-table>
        </div>
      </section>
    </main>

    <ui5-dialog
      ref="aiRuleDialogRef"
      class="dialog"
      header-text="AI Transfer Rules"
      @after-close="onAiRuleAfterClose"
    >
      <div class="dialog-content ai-rules">
        <section class="rule-section default-section">
          <div class="rule-header">Default rules</div>
          <p class="rule-caption">Configured based on corporate policy; editing is currently not supported.</p>
          <ul class="rule-list">
            <li v-for="rule in defaultRules" :key="rule">{{ rule }}</li>
          </ul>
        </section>
        <section class="rule-section editable-section">
          <div class="rule-header">User preferences</div>
          <p class="rule-caption">Your preferences are applied on top of the default rules and can be fine-tuned as needed.</p>
          <ul class="rule-list">
            <li v-for="rule in userPreferenceRules" :key="rule">{{ rule }}</li>
          </ul>
          <ui5-button class="rule-edit-button" design="Transparent" @click="onEditPreferences">Edit preferences</ui5-button>
          <p class="rule-hint">Click Edit to adjust your personal preferences.</p>
        </section>
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Emphasized" @click="closeAiRuleDialog">Done</ui5-button>
      </div>
    </ui5-dialog>

    <ui5-dialog ref="confirmDialogRef" class="dialog" header-text="Transfer Confirmation">
      <div class="dialog-content form-grid">
        <div class="field">
          <ui5-label for="confirm-material">Material</ui5-label>
          <ui5-input
            id="confirm-material"
            :value="confirmForm.material"
            @input="handleConfirmInput('material')"
          />
        </div>
        <div class="field">
          <ui5-label for="confirm-plant">Plant</ui5-label>
          <ui5-input
            id="confirm-plant"
            :value="confirmForm.plant"
            @input="handleConfirmInput('plant')"
          />
        </div>
        <div class="field">
          <ui5-label for="confirm-target">Target Warehouse</ui5-label>
          <ui5-input
            id="confirm-target"
            :value="confirmForm.targetWarehouse"
            @input="handleConfirmInput('targetWarehouse')"
          />
        </div>
        <div class="field">
          <ui5-label for="confirm-source">Source Warehouse</ui5-label>
          <ui5-input
            id="confirm-source"
            :value="confirmForm.sourceWarehouse"
            @input="handleConfirmInput('sourceWarehouse')"
          />
        </div>
        <div class="field">
          <ui5-label for="confirm-qty">Quantity</ui5-label>
          <ui5-input
            id="confirm-qty"
            :value="confirmForm.quantity"
            @input="handleConfirmInput('quantity')"
          />
        </div>
        <div class="field">
          <ui5-label for="confirm-date">Date</ui5-label>
          <ui5-date-picker
            id="confirm-date"
            :value="confirmForm.date"
            @change="onConfirmDateChange"
          />
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Transparent" @click="closeConfirmDialog">Cancel</ui5-button>
        <ui5-button design="Emphasized" @click="onConfirmDialogApprove">Confirm</ui5-button>
      </div>
    </ui5-dialog>

    <ui5-dialog ref="emailDialogRef" class="dialog" header-text="Send Email Notification">
      <div class="dialog-content">
        <div class="email-info">Transfer order {{ transferOrderNumber }} has been created.</div>
        <div class="email-meta">
          <div class="field">
            <ui5-label for="email-sender">Sender</ui5-label>
            <ui5-input
              id="email-sender"
              :value="emailForm.sender"
              @input="handleEmailFormInput('sender')"
            />
          </div>
          <div class="field">
            <ui5-label for="email-to">To</ui5-label>
            <ui5-input
              id="email-to"
              :value="emailForm.to"
              @input="handleEmailFormInput('to')"
            />
          </div>
          <div class="field">
            <ui5-label for="email-cc">Cc</ui5-label>
            <ui5-input
              id="email-cc"
              :value="emailForm.cc"
              @input="handleEmailFormInput('cc')"
            />
          </div>
          <div class="field">
            <ui5-label for="email-subject">Subject</ui5-label>
            <ui5-input
              id="email-subject"
              :value="emailForm.subject"
              @input="handleEmailFormInput('subject')"
            />
          </div>
        </div>
        <ui5-textarea
          rows="10"
          growing
          growing-max-lines="15"
          :value="emailContent"
          @input="onEmailInput"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <ui5-button design="Transparent" @click="onEmailCancel">Cancel</ui5-button>
        <ui5-button design="Positive" @click="onEmailSend">Send</ui5-button>
      </div>
    </ui5-dialog>

    <ui5-toast ref="toastRef" placement="BottomCenter">{{ toastMessage }}</ui5-toast>
    <ui5-popover ref="durationTooltipRef" hide-arrow placement-type="Top" class="tooltip-popover">
      <div class="tooltip-content">
        Road<br />
        Distance from source warehouse to target warehouse.<br />
      </div>
    </ui5-popover>
    <ui5-popover ref="amountTooltipRef" hide-arrow placement-type="Top" class="tooltip-popover">
      <div class="tooltip-content">
        Road Unit<br />
        Unit of measurement for road distance (default: KM).<br />
      </div>
    </ui5-popover>
    <ui5-popover ref="aiReasonTooltipRef" hide-arrow placement-type="Top" class="tooltip-popover">
      <div class="tooltip-content">
        AI recommendation result<br />
        The Smart Transfer Agent combines S/4 real-time inventory, transit time, transfer cost, user preferences, and other dimensions, and uses a weighted scoring model to evaluate and rank candidate warehouses, providing better transfer recommendations for decision makers.
      </div>
    </ui5-popover>

    <div v-if="isActionLoading" class="action-loading">
      <div class="action-loading-box">
        <ui5-busy-indicator size="Large" active></ui5-busy-indicator>
        <p>{{ actionLoadingMessage }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f6f7;
}

.sap-logo {
  height: 1.5rem;
}

.content {
  flex: 1;
  padding: 1.5rem 2rem 2.5rem;
  max-width: min(100vw - 60px, 1600px);
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-card,
.table-card {
  background-color: #ffffff;
  border-radius: 0.75rem;
  box-shadow: 0 0.25rem 1.25rem rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #1d2d3a;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.table-card {
  padding: 0;
  overflow: visible;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  position: relative;
}

.table-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 360px;
  color: #0a6ed1;
  font-weight: 600;
  letter-spacing: 0.01em;
}

.table-loading p {
  margin: 0;
  font-size: 1.05rem;
}

.table-card.wide .recommendation-table {
  min-width: 1380px;
}

.selection-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  width: 100%;
  padding: 0;
  cursor: pointer;
}

.ai-reason-cell {
  min-width: 300px;
}

.ai-text {
  display: block;
  white-space: normal;
  line-height: 1.5;
  word-break: break-word;
  overflow-wrap: anywhere;
  max-width: 100%;
}

.ai-header {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  color: #324a5e;
}

.header-label {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  color: #324a5e;
  cursor: help;
}

.hover-label {
  cursor: help;
  outline: none;
}

.hover-label:focus-visible {
  box-shadow: 0 0 0 2px rgba(10, 110, 209, 0.2);
  border-radius: 0.4rem;
}

.derived-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(10, 110, 209, 0.12), rgba(10, 110, 209, 0.24));
  border: 1px solid rgba(10, 110, 209, 0.35);
  color: #0a6ed1;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px rgba(10, 110, 209, 0.12);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.derived-label:hover,
.derived-label:focus-visible {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(10, 110, 209, 0.18);
}

:deep(ui5-table-header-row) {
  overflow: visible;
}

:deep(.tooltip-cell) {
  overflow: visible !important;
}

:deep(.tooltip-cell .hover-label:hover),
:deep(.tooltip-cell .hover-label:focus-visible) {
  z-index: 30;
  position: relative;
}

.tooltip-content {
  font-size: 0.8rem;
  line-height: 1.4;
  color: #1d2d3a;
  max-width: 260px;
  padding: 0.25rem 0.5rem;
}

:deep(.tooltip-popover::part(content)) {
  padding: 0.4rem 0.75rem;
}

.action-loading {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.action-loading-box {
  background: #ffffff;
  border-radius: 0.85rem;
  padding: 1.5rem 2.25rem;
  box-shadow: 0 1.5rem 3rem rgba(15, 55, 95, 0.16);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  min-width: 260px;
  text-align: center;
  color: #0a2a43;
  font-weight: 600;
}

.action-loading-box p {
  margin: 0;
}

.ai-header-icon {
  color: #0a6ed1;
  font-size: 1rem;
  width: 1rem;
  height: 1rem;
  display: inline-block;
}

:deep(.row-checkbox) {
  --sapField_BorderColor: #5d7ec5;
  --sapField_Hover_BorderColor: #0a6ed1;
  --sapField_Background: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  min-height: 20px;
}

:deep(.row-checkbox::part(root)) {
  padding: 0.5rem;
  cursor: pointer;
}

:deep(.row-checkbox::part(native-input)) {
  cursor: pointer;
}

:deep(.table-row) {
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.recommendation-table {
  width: 100%;
  --sapList_HeaderBorderColor: #d5deeb;
  --sapList_BorderColor: #e4e9f1;
  --sapList_Background: #ffffff;
  --sapList_Hover_Background: #f3f6f9;
  --sapList_SelectionBackgroundColor: #ebf3ff;
  --sapTable_Header_Row_Background: transparent;
}

:deep(.ui5-table-header-row) {
  background: linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%);
}

:deep(.ui5-table-header-row .ui5-table-cell) {
  border-bottom: 1px solid #d5deeb;
  font-size: 0.85rem;
  font-weight: 600;
  color: #324a5e;
  padding: 0.75rem 1rem;
}

:deep(.table-row .ui5-table-cell) {
  border-bottom: 1px solid #e4e9f1;
  padding: 0.85rem 1rem;
  font-size: 0.95rem;
  color: #2f3c48;
}

:deep(.table-row .ui5-table-cell:first-child) {
  padding: 0;
}

:deep(.table-row:nth-child(even) .ui5-table-cell) {
  background-color: #fafcff;
}

:deep(.table-row:not(.selected):hover .ui5-table-cell) {
  background-color: #f3f6f9;
}

:deep(.table-row.selected .ui5-table-cell) {
  background-color: #ebf3ff;
  box-shadow: inset 3px 0 0 #0a6ed1;
}

:deep(.table-row.selected:hover .ui5-table-cell) {
  background-color: #e1ecff;
}

:deep(.table-row .ui5-table-cell:not(:last-child)) {
  border-right: 1px solid #edf1f6;
}

.priority-cell {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 1.75rem;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.4rem;
  background-color: #e5f5eb;
  color: #107e3e;
  font-weight: 600;
  font-size: 0.95rem;
}

.priority-badge.warn {
  background-color: #fff6d1; /* light yellow */
  color: #8a6d00; /* dark yellow text for contrast */
}

.status-icon {
  font-size: 1.1rem;
  color: inherit;
}

.ai-rules {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.25rem 0 0.75rem;
}

.rule-section {
  border: 1px solid #d5deeb;
  border-radius: 0.6rem;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rule-section.default-section {
  background-color: #f5f7fa;
  color: #4c6275;
}

.rule-section.editable-section {
  background-color: #ffffff;
}

.rule-header {
  font-weight: 600;
  color: #1d2d3a;
}

.rule-caption {
  margin: 0;
  color: #5f7387;
  font-size: 0.85rem;
}

.rule-list {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  color: #2f3c48;
}

.rule-edit-button {
  align-self: flex-start;
  margin-top: 0.25rem;
}

.rule-hint {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7c90;
}

:deep(.ai-rule-button::part(button)) {
  border: 1px solid #c7d3e3;
  border-radius: 0.5rem;
  padding: 0 1.2rem; /* keep right padding */
  padding-left: 2rem; /* space for the icon */
  background-image: url('/ai.svg');
  background-repeat: no-repeat;
  background-position: 0.6rem center;
  background-size: 1rem 1rem;
}

:deep(.ai-rule-button::part(button):hover) {
  border-color: #0a6ed1;
}

:deep(.rule-edit-button::part(button)) {
  border: 1px solid #c7d3e3;
  border-radius: 0.5rem;
  padding: 0 1rem;
  color: #0a6ed1;
}

:deep(.rule-edit-button::part(button):hover) {
  background-color: #eef4fb;
}

.status-icon.danger {
  color: #a1260d;
}

.cell {
  display: inline-flex;
  align-items: center;
  font-size: 0.95rem;
  color: #2f3c48;
}

.dual-line {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
  line-height: 1.3;
  max-width: 160px;
}

.dual-line .code {
  font-weight: 600;
  color: #0e2a45;
}

.dual-line .name {
  font-size: 0.85rem;
  color: #3f5567;
  white-space: normal;
}

.cell-strong {
  font-weight: 600;
  color: #0e2a45;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wrap-text {
  white-space: normal;
  line-height: 1.45;
}

.dialog {
  max-width: 520px;
}

.dialog-content {
  padding: 0.5rem 0;
}

.email-info {
  margin-bottom: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  background: #eef4fb;
  color: #0a6ed1;
  font-size: 0.9rem;
  font-weight: 600;
}

.email-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem 1.5rem;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem 1.5rem;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem 3rem;
}

:deep(.dialog-footer ui5-button::part(button)) {
  padding: 0 1.25rem;
  min-width: 4.5rem;
}

@media (max-width: 900px) {
  .content {
    padding: 1rem;
  }

  .filter-card,
  .table-card {
    padding: 1rem;
  }

  .dialog {
    max-width: 90vw;
  }
}

@media (max-width: 1360px) {
  .recommendation-table {
    min-width: 1020px;
  }
}
</style>
