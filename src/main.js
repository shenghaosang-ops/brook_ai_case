import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Load UI5 web components assets and icons used across the app
import '@ui5/webcomponents/dist/Assets.js'
import '@ui5/webcomponents-fiori/dist/Assets.js'

// 设置 UI5 语言为英文
import { setLanguage } from '@ui5/webcomponents-base/dist/config/Language.js'
setLanguage('en')

import '@ui5/webcomponents/dist/Button.js'
import '@ui5/webcomponents/dist/Input.js'
import '@ui5/webcomponents/dist/Icon.js'
import '@ui5/webcomponents/dist/Table.js'
import '@ui5/webcomponents/dist/TableHeaderRow.js'
import '@ui5/webcomponents/dist/TableHeaderCell.js'
import '@ui5/webcomponents/dist/TableRow.js'
import '@ui5/webcomponents/dist/TableCell.js'
import '@ui5/webcomponents/dist/Toast.js'
import '@ui5/webcomponents/dist/Label.js'
import '@ui5/webcomponents/dist/TextArea.js'
import '@ui5/webcomponents/dist/DatePicker.js'
import '@ui5/webcomponents/dist/Dialog.js'
import '@ui5/webcomponents/dist/Avatar.js'
import '@ui5/webcomponents/dist/CheckBox.js'
import '@ui5/webcomponents/dist/BusyIndicator.js'
import '@ui5/webcomponents/dist/Popover.js'

import '@ui5/webcomponents-fiori/dist/ShellBar.js'
import '@ui5/webcomponents/dist/List.js'
import '@ui5/webcomponents/dist/ListItemStandard.js'

import '@ui5/webcomponents-icons/dist/accept.js'
import '@ui5/webcomponents-icons/dist/decline.js'
import '@ui5/webcomponents-icons/dist/email.js'
import '@ui5/webcomponents-icons/dist/status-error.js'
import '@ui5/webcomponents-icons/dist/workflow-tasks.js'
import '@ui5/webcomponents-icons/dist/lightbulb.js'
import '@ui5/webcomponents-icons/dist/create.js'
import '@ui5/webcomponents-icons/dist/action-settings.js'
import '@ui5/webcomponents-icons/dist/sys-help.js'
import '@ui5/webcomponents-icons/dist/employee.js'

createApp(App).mount('#app')
