<template>
<div class="container-fluid" id="app">
	<div class="page-header text-center">
		<h1>The Ledger</h1>
	</div>

	<router-view></router-view>
</div>
</template>

<style>
/* typography rules */
body {
	font-family: monospace;
}

/* rules for button icons */
.button-icon {
	color: #808080;
}

.button-icon:hover,
.button-icon:focus {
	text-decoration: none;
	cursor: pointer;
	color: #303030;
}
</style>
