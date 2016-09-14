/* global $, PIXI, Stats, requestAnimationFrame, cancelAnimationFrame */

'use strict'

$(document).ready(onReady)

$(window).resize(delayedResize)
window.onorientationchange = delayedResize

var resizeRequest

function delayedResize () {
  if (resizeRequest) clearTimeout(resizeRequest)
  resizeRequest = setTimeout(resize, 500)
}

var width = window.innerWidth
var height = window.innerHeight

var beeTexture

var bees = []
// var gravity = 0.5

var maxX = width
var minX = 0
var maxY = height
var minY = 0

var startBeeCount = 100
var maxBees = 100000
var isAdding = false
var count = 0
var container

var amount = 5

var offset = {
  x: 0,
  y: 0
}

var mousePos = {
  x: 0,
  y: 0
}

var stats
var counter

var renderer
var stage

var isWebGL

var animFrame

function onReady () {
  init()
  resize()
  // update()
}

// var SVG_SOURCE = 'bee.svg'
// var SVG_SOURCE = 'bee.png'
// var SVG_SOURCE = 'http://rzq.pw/bee.png'

// var serializedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" enable-background="new 0 0 64 64"><path fill="#3f3438" d="M53.24 49.886 62 60.795 48.703 56.52z"/><path fill="#ffce31" d="m51.03 30.786l-.242 2.564 1.87-1.798-.488 2.538 2.05-1.609-.78 2.464 2.231-1.351-1.091 2.345 2.397-1.041-1.417 2.172 2.53-.68-1.74 1.93 2.6-.29-2.01 1.645 2.612.097-2.23 1.348 2.571.448-2.391 1.046 2.497.766-2.507.82 2.39 1.12-2.58.526 2.23 1.384-2.631.22 2.051 1.64-2.64-.08 1.85 1.857-2.61-.377 1.63 2.05-2.557-.65 1.397 2.2-2.47-.9 1.171 2.33-2.371-1.14.94 2.433-2.26-1.353.713 2.506-2.122-1.546.479 2.557-1.97-1.727.26 2.594-1.828-1.881.042 2.597-1.664-2.02-.168 2.6-1.502-2.144-.374 2.574-1.317-2.25-.581 2.537-1.14-2.347-.778 2.49-.96-2.43-.96 2.43-.77-2.49-1.14 2.348-.578-2.538-1.322 2.25-.377-2.574-1.493 2.144-.17-2.6-1.665 2.03.041-2.608-1.824 1.882.258-2.594-1.98 1.727.483-2.557-2.122 1.544.709-2.504-2.253 1.351.939-2.431-2.373 1.14 1.171-2.33-2.473.9 1.4-2.204-2.551.654z"/><path fill="#3f3438" d="m10.896 39.65l36.404-11.824-.487 2.533 2.048-1.605-.771 2.466 2.22-1.353-1.08 2.343 2.392-1.04-1.412 2.17 2.519-.681-1.732 1.934 2.598-.293-2.01 1.648 2.607.102-2.227 1.34 2.567.452-2.39 1.046 2.502.762-2.502.828 2.38 1.114-2.579.528 2.229 1.389-2.63.221 2.055 1.64-2.637-.09 1.848 1.86-2.616-.373 1.633 2.046-2.553-.653 1.398 2.21-2.468-.91 1.17 2.334-2.376-1.14.939 2.436-2.253-1.359.71 2.509-2.12-1.549.479 2.559-1.977-1.72.258 2.59-1.82-1.88.04 2.598-1.664-2.02-.166 2.594-1.499-2.14-.378 2.576-1.313-2.256-.585 2.54-1.14-2.347-.776 2.487-.959-2.422-.959 2.422-.771-2.487-1.145 2.347-.575-2.54-1.323 2.256-.378-2.576-1.489 2.15-.177-2.603-1.662 2.023.039-2.6-1.824 1.88.262-2.59-1.981 1.72.484-2.559-2.121 1.549.705-2.51-2.253 1.35.939-2.429-2.371 1.14 1.17-2.331-2.475.91 1.403-2.21-2.556.65 1.63-2.047-2.612.377 1.848-1.86-2.637.08 2.051-1.634-2.628-.221 2.232-1.385-2.586-.527 2.386-1.115z"/><g fill="#c9e4f2"><path d="m60.05 4.332c-3.603-4.513-10.246-2.28-14.839 4.994-4.595 7.272-7.952 19.966-7.952 19.966s15.536 2.551 20.13-4.715c4.594-7.268 6.265-15.731 2.664-20.245"/><path d="m3.917 8.889c-3.541 4.339-1.892 12.395 2.62 19.291 4.518 6.894 19.788 4.308 19.788 4.308s-3.305-12.08-7.818-18.973c-4.517-6.898-11.05-8.967-14.59-4.626"/></g><path fill="#ffce31" d="m33.61 25.23l.975-1.805.339 2.02 1.086-1.748.21 2.037 1.193-1.675.064 2.05 1.318-1.585-.101 2.044 1.446-1.469-.287 2.03 1.587-1.32-.508 1.985 1.725-1.137-.741 1.911 1.856-.913-.99 1.798 1.966-.655-1.234 1.644 2.039-.373-1.463 1.451 2.07-.086-1.642 1.241 2.065.182-1.793 1.031 2.029.421-1.899.83 1.973.633-1.976.694 1.893.883-2.038.492 1.788 1.08-2.08.278 1.67 1.253-2.1.059 1.524 1.422-2.09-.153 1.37 1.569-2.065-.366 1.203 1.695-2.02-.559 1.024 1.8-1.95-.75.852 1.89-1.872-.93.667 1.96-1.778-1.096.481 2.02-1.667-1.257.297 2.048-1.55-1.401.104 2.07-1.414-1.531-.08 2.071-1.27-1.65-.268 2.05-1.116-1.751-.452 2.02-.954-1.84-.632 1.973-.793-1.914-.792 1.914-.623-1.973-.96 1.84-.453-2.02-1.115 1.751-.269-2.05-1.263 1.65-.09-2.072-1.411 1.532.101-2.07-1.54 1.4.289-2.048-1.668 1.258.48-2.02-1.777 1.099.666-1.96-1.871.93.851-1.89-1.955.746 1.031-1.796-2.02.556z"/><path fill="#3f3438" d="m9.237 33.14l1.773-.598-1.714-.747 1.824-.432-1.633-.908 1.854-.245-1.515-1.08 1.871-.02-1.367-1.263 1.857.213-1.187-1.426 1.812.456-.982-1.571 1.734.691-.766-1.681 1.631.906-.549-1.766 1.511 1.091-.341-1.814 1.382 1.244-.159-1.841 1.258 1.367.004-1.846 1.143 1.462.151-1.84 1.029 1.548.282-1.83.92 1.604.396-1.804.831 1.652.494-1.782.744 1.695.575-1.755.671 1.727.663-1.727.586 1.755.739-1.695.491 1.782.83-1.652.396 1.803.926-1.603.286 1.83 1.032-1.546.154 1.84 1.146-1.462v1.848l1.27-1.365-.16 1.845 1.385-1.245-.345 1.813 1.51-1.087-.55 1.763 1.629-.903-.768 1.679 1.735-.688-.987 1.568 1.814-.455-1.193 1.425 1.86-.214-1.369 1.254 1.87.03-1.521 1.08 1.86.236-1.631.908 1.821.433-1.714.746 1.774.597-1.776.657 1.706.81-1.83.493 1.62.96-1.86.32 1.523 1.111-1.888.149 1.415 1.243-1.9-.028 1.289 1.375-1.882-.21 1.15 1.488-1.857-.378 1.01 1.584-1.81-.544.84 1.667-1.75-.717.689 1.744-1.669-.874.511 1.799-1.581-1.028.336 1.839-1.476-1.17.16 1.86-1.352-1.31-.03 1.868-1.215-1.428-.216 1.85-1.067-1.54-.4 1.828-.91-1.639-.572 1.78-.747-1.717-.741 1.717-.578-1.78-.911 1.639-.401-1.828-1.07 1.54-.207-1.85-1.217 1.428-.029-1.869-1.352 1.311.155-1.87-1.474 1.178.337-1.838-1.582 1.026.516-1.798-1.675.874.687-1.742-1.751.714.849-1.674-1.812.551 1.01-1.581-1.855.374 1.15-1.484-1.882.21 1.287-1.376-1.893.029 1.412-1.245-1.889-.148 1.524-1.11-1.866-.32 1.623-.96-1.827-.494 1.705-.811z"/><path fill="#fcfcfa" d="m34.633 32.504c0 3.602-2.906 6.517-6.492 6.517-3.584 0-6.49-2.915-6.49-6.517 0-3.596 2.906-6.513 6.49-6.513 3.586 0 6.492 2.917 6.492 6.513"/><path fill="#3f3438" d="m33.619 32.504c0 2.476-1.998 4.481-4.465 4.481-2.461 0-4.461-2.01-4.461-4.481 0-2.474 2-4.48 4.461-4.48 2.467 0 4.465 2.01 4.465 4.48"/><ellipse fill="#fcfcfa" cx="14.845" cy="32.504" rx="5.41" ry="5.43"/><g fill="#3f3438"><ellipse cx="15.858" cy="32.504" rx="3.72" ry="3.734"/><path d="m36.32 16.912c-5.478-.146-8.747 1.894-10.291 6.01-.221.588.706.833.982.271 1.275-2.588 3.475-5.567 9.307-5.252 0 0 .001 0 .002 0 .635 0 .635-1.025 0-1.025"/><path d="m17.842 24.615c-3.768-3.925-7.543-4.761-11.582-2.933-.578.262-.097 1.082.499.879 2.758-.941 6.448-1.514 10.346 2.778 0 0 .001 0 .002 0 .45.444 1.184-.28.735-.724"/></g></svg>'
var base64Svg = 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDY0IDY0IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA2NCA2NCI+PHBhdGggZmlsbD0iIzNmMzQzOCIgZD0iTTUzLjI0IDQ5Ljg4NiA2MiA2MC43OTUgNDguNzAzIDU2LjUyeiIvPjxwYXRoIGZpbGw9IiNmZmNlMzEiIGQ9Im01MS4wMyAzMC43ODZsLS4yNDIgMi41NjQgMS44Ny0xLjc5OC0uNDg4IDIuNTM4IDIuMDUtMS42MDktLjc4IDIuNDY0IDIuMjMxLTEuMzUxLTEuMDkxIDIuMzQ1IDIuMzk3LTEuMDQxLTEuNDE3IDIuMTcyIDIuNTMtLjY4LTEuNzQgMS45MyAyLjYtLjI5LTIuMDEgMS42NDUgMi42MTIuMDk3LTIuMjMgMS4zNDggMi41NzEuNDQ4LTIuMzkxIDEuMDQ2IDIuNDk3Ljc2Ni0yLjUwNy44MiAyLjM5IDEuMTItMi41OC41MjYgMi4yMyAxLjM4NC0yLjYzMS4yMiAyLjA1MSAxLjY0LTIuNjQtLjA4IDEuODUgMS44NTctMi42MS0uMzc3IDEuNjMgMi4wNS0yLjU1Ny0uNjUgMS4zOTcgMi4yLTIuNDctLjkgMS4xNzEgMi4zMy0yLjM3MS0xLjE0Ljk0IDIuNDMzLTIuMjYtMS4zNTMuNzEzIDIuNTA2LTIuMTIyLTEuNTQ2LjQ3OSAyLjU1Ny0xLjk3LTEuNzI3LjI2IDIuNTk0LTEuODI4LTEuODgxLjA0MiAyLjU5Ny0xLjY2NC0yLjAyLS4xNjggMi42LTEuNTAyLTIuMTQ0LS4zNzQgMi41NzQtMS4zMTctMi4yNS0uNTgxIDIuNTM3LTEuMTQtMi4zNDctLjc3OCAyLjQ5LS45Ni0yLjQzLS45NiAyLjQzLS43Ny0yLjQ5LTEuMTQgMi4zNDgtLjU3OC0yLjUzOC0xLjMyMiAyLjI1LS4zNzctMi41NzQtMS40OTMgMi4xNDQtLjE3LTIuNi0xLjY2NSAyLjAzLjA0MS0yLjYwOC0xLjgyNCAxLjg4Mi4yNTgtMi41OTQtMS45OCAxLjcyNy40ODMtMi41NTctMi4xMjIgMS41NDQuNzA5LTIuNTA0LTIuMjUzIDEuMzUxLjkzOS0yLjQzMS0yLjM3MyAxLjE0IDEuMTcxLTIuMzMtMi40NzMuOSAxLjQtMi4yMDQtMi41NTEuNjU0eiIvPjxwYXRoIGZpbGw9IiMzZjM0MzgiIGQ9Im0xMC44OTYgMzkuNjVsMzYuNDA0LTExLjgyNC0uNDg3IDIuNTMzIDIuMDQ4LTEuNjA1LS43NzEgMi40NjYgMi4yMi0xLjM1My0xLjA4IDIuMzQzIDIuMzkyLTEuMDQtMS40MTIgMi4xNyAyLjUxOS0uNjgxLTEuNzMyIDEuOTM0IDIuNTk4LS4yOTMtMi4wMSAxLjY0OCAyLjYwNy4xMDItMi4yMjcgMS4zNCAyLjU2Ny40NTItMi4zOSAxLjA0NiAyLjUwMi43NjItMi41MDIuODI4IDIuMzggMS4xMTQtMi41NzkuNTI4IDIuMjI5IDEuMzg5LTIuNjMuMjIxIDIuMDU1IDEuNjQtMi42MzctLjA5IDEuODQ4IDEuODYtMi42MTYtLjM3MyAxLjYzMyAyLjA0Ni0yLjU1My0uNjUzIDEuMzk4IDIuMjEtMi40NjgtLjkxIDEuMTcgMi4zMzQtMi4zNzYtMS4xNC45MzkgMi40MzYtMi4yNTMtMS4zNTkuNzEgMi41MDktMi4xMi0xLjU0OS40NzkgMi41NTktMS45NzctMS43Mi4yNTggMi41OS0xLjgyLTEuODguMDQgMi41OTgtMS42NjQtMi4wMi0uMTY2IDIuNTk0LTEuNDk5LTIuMTQtLjM3OCAyLjU3Ni0xLjMxMy0yLjI1Ni0uNTg1IDIuNTQtMS4xNC0yLjM0Ny0uNzc2IDIuNDg3LS45NTktMi40MjItLjk1OSAyLjQyMi0uNzcxLTIuNDg3LTEuMTQ1IDIuMzQ3LS41NzUtMi41NC0xLjMyMyAyLjI1Ni0uMzc4LTIuNTc2LTEuNDg5IDIuMTUtLjE3Ny0yLjYwMy0xLjY2MiAyLjAyMy4wMzktMi42LTEuODI0IDEuODguMjYyLTIuNTktMS45ODEgMS43Mi40ODQtMi41NTktMi4xMjEgMS41NDkuNzA1LTIuNTEtMi4yNTMgMS4zNS45MzktMi40MjktMi4zNzEgMS4xNCAxLjE3LTIuMzMxLTIuNDc1LjkxIDEuNDAzLTIuMjEtMi41NTYuNjUgMS42My0yLjA0Ny0yLjYxMi4zNzcgMS44NDgtMS44Ni0yLjYzNy4wOCAyLjA1MS0xLjYzNC0yLjYyOC0uMjIxIDIuMjMyLTEuMzg1LTIuNTg2LS41MjcgMi4zODYtMS4xMTV6Ii8+PGcgZmlsbD0iI2M5ZTRmMiI+PHBhdGggZD0ibTYwLjA1IDQuMzMyYy0zLjYwMy00LjUxMy0xMC4yNDYtMi4yOC0xNC44MzkgNC45OTQtNC41OTUgNy4yNzItNy45NTIgMTkuOTY2LTcuOTUyIDE5Ljk2NnMxNS41MzYgMi41NTEgMjAuMTMtNC43MTVjNC41OTQtNy4yNjggNi4yNjUtMTUuNzMxIDIuNjY0LTIwLjI0NSIvPjxwYXRoIGQ9Im0zLjkxNyA4Ljg4OWMtMy41NDEgNC4zMzktMS44OTIgMTIuMzk1IDIuNjIgMTkuMjkxIDQuNTE4IDYuODk0IDE5Ljc4OCA0LjMwOCAxOS43ODggNC4zMDhzLTMuMzA1LTEyLjA4LTcuODE4LTE4Ljk3M2MtNC41MTctNi44OTgtMTEuMDUtOC45NjctMTQuNTktNC42MjYiLz48L2c+PHBhdGggZmlsbD0iI2ZmY2UzMSIgZD0ibTMzLjYxIDI1LjIzbC45NzUtMS44MDUuMzM5IDIuMDIgMS4wODYtMS43NDguMjEgMi4wMzcgMS4xOTMtMS42NzUuMDY0IDIuMDUgMS4zMTgtMS41ODUtLjEwMSAyLjA0NCAxLjQ0Ni0xLjQ2OS0uMjg3IDIuMDMgMS41ODctMS4zMi0uNTA4IDEuOTg1IDEuNzI1LTEuMTM3LS43NDEgMS45MTEgMS44NTYtLjkxMy0uOTkgMS43OTggMS45NjYtLjY1NS0xLjIzNCAxLjY0NCAyLjAzOS0uMzczLTEuNDYzIDEuNDUxIDIuMDctLjA4Ni0xLjY0MiAxLjI0MSAyLjA2NS4xODItMS43OTMgMS4wMzEgMi4wMjkuNDIxLTEuODk5LjgzIDEuOTczLjYzMy0xLjk3Ni42OTQgMS44OTMuODgzLTIuMDM4LjQ5MiAxLjc4OCAxLjA4LTIuMDguMjc4IDEuNjcgMS4yNTMtMi4xLjA1OSAxLjUyNCAxLjQyMi0yLjA5LS4xNTMgMS4zNyAxLjU2OS0yLjA2NS0uMzY2IDEuMjAzIDEuNjk1LTIuMDItLjU1OSAxLjAyNCAxLjgtMS45NS0uNzUuODUyIDEuODktMS44NzItLjkzLjY2NyAxLjk2LTEuNzc4LTEuMDk2LjQ4MSAyLjAyLTEuNjY3LTEuMjU3LjI5NyAyLjA0OC0xLjU1LTEuNDAxLjEwNCAyLjA3LTEuNDE0LTEuNTMxLS4wOCAyLjA3MS0xLjI3LTEuNjUtLjI2OCAyLjA1LTEuMTE2LTEuNzUxLS40NTIgMi4wMi0uOTU0LTEuODQtLjYzMiAxLjk3My0uNzkzLTEuOTE0LS43OTIgMS45MTQtLjYyMy0xLjk3My0uOTYgMS44NC0uNDUzLTIuMDItMS4xMTUgMS43NTEtLjI2OS0yLjA1LTEuMjYzIDEuNjUtLjA5LTIuMDcyLTEuNDExIDEuNTMyLjEwMS0yLjA3LTEuNTQgMS40LjI4OS0yLjA0OC0xLjY2OCAxLjI1OC40OC0yLjAyLTEuNzc3IDEuMDk5LjY2Ni0xLjk2LTEuODcxLjkzLjg1MS0xLjg5LTEuOTU1Ljc0NiAxLjAzMS0xLjc5Ni0yLjAyLjU1NnoiLz48cGF0aCBmaWxsPSIjM2YzNDM4IiBkPSJtOS4yMzcgMzMuMTRsMS43NzMtLjU5OC0xLjcxNC0uNzQ3IDEuODI0LS40MzItMS42MzMtLjkwOCAxLjg1NC0uMjQ1LTEuNTE1LTEuMDggMS44NzEtLjAyLTEuMzY3LTEuMjYzIDEuODU3LjIxMy0xLjE4Ny0xLjQyNiAxLjgxMi40NTYtLjk4Mi0xLjU3MSAxLjczNC42OTEtLjc2Ni0xLjY4MSAxLjYzMS45MDYtLjU0OS0xLjc2NiAxLjUxMSAxLjA5MS0uMzQxLTEuODE0IDEuMzgyIDEuMjQ0LS4xNTktMS44NDEgMS4yNTggMS4zNjcuMDA0LTEuODQ2IDEuMTQzIDEuNDYyLjE1MS0xLjg0IDEuMDI5IDEuNTQ4LjI4Mi0xLjgzLjkyIDEuNjA0LjM5Ni0xLjgwNC44MzEgMS42NTIuNDk0LTEuNzgyLjc0NCAxLjY5NS41NzUtMS43NTUuNjcxIDEuNzI3LjY2My0xLjcyNy41ODYgMS43NTUuNzM5LTEuNjk1LjQ5MSAxLjc4Mi44My0xLjY1Mi4zOTYgMS44MDMuOTI2LTEuNjAzLjI4NiAxLjgzIDEuMDMyLTEuNTQ2LjE1NCAxLjg0IDEuMTQ2LTEuNDYydjEuODQ4bDEuMjctMS4zNjUtLjE2IDEuODQ1IDEuMzg1LTEuMjQ1LS4zNDUgMS44MTMgMS41MS0xLjA4Ny0uNTUgMS43NjMgMS42MjktLjkwMy0uNzY4IDEuNjc5IDEuNzM1LS42ODgtLjk4NyAxLjU2OCAxLjgxNC0uNDU1LTEuMTkzIDEuNDI1IDEuODYtLjIxNC0xLjM2OSAxLjI1NCAxLjg3LjAzLTEuNTIxIDEuMDggMS44Ni4yMzYtMS42MzEuOTA4IDEuODIxLjQzMy0xLjcxNC43NDYgMS43NzQuNTk3LTEuNzc2LjY1NyAxLjcwNi44MS0xLjgzLjQ5MyAxLjYyLjk2LTEuODYuMzIgMS41MjMgMS4xMTEtMS44ODguMTQ5IDEuNDE1IDEuMjQzLTEuOS0uMDI4IDEuMjg5IDEuMzc1LTEuODgyLS4yMSAxLjE1IDEuNDg4LTEuODU3LS4zNzggMS4wMSAxLjU4NC0xLjgxLS41NDQuODQgMS42NjctMS43NS0uNzE3LjY4OSAxLjc0NC0xLjY2OS0uODc0LjUxMSAxLjc5OS0xLjU4MS0xLjAyOC4zMzYgMS44MzktMS40NzYtMS4xNy4xNiAxLjg2LTEuMzUyLTEuMzEtLjAzIDEuODY4LTEuMjE1LTEuNDI4LS4yMTYgMS44NS0xLjA2Ny0xLjU0LS40IDEuODI4LS45MS0xLjYzOS0uNTcyIDEuNzgtLjc0Ny0xLjcxNy0uNzQxIDEuNzE3LS41NzgtMS43OC0uOTExIDEuNjM5LS40MDEtMS44MjgtMS4wNyAxLjU0LS4yMDctMS44NS0xLjIxNyAxLjQyOC0uMDI5LTEuODY5LTEuMzUyIDEuMzExLjE1NS0xLjg3LTEuNDc0IDEuMTc4LjMzNy0xLjgzOC0xLjU4MiAxLjAyNi41MTYtMS43OTgtMS42NzUuODc0LjY4Ny0xLjc0Mi0xLjc1MS43MTQuODQ5LTEuNjc0LTEuODEyLjU1MSAxLjAxLTEuNTgxLTEuODU1LjM3NCAxLjE1LTEuNDg0LTEuODgyLjIxIDEuMjg3LTEuMzc2LTEuODkzLjAyOSAxLjQxMi0xLjI0NS0xLjg4OS0uMTQ4IDEuNTI0LTEuMTEtMS44NjYtLjMyIDEuNjIzLS45Ni0xLjgyNy0uNDk0IDEuNzA1LS44MTF6Ii8+PHBhdGggZmlsbD0iI2ZjZmNmYSIgZD0ibTM0LjYzMyAzMi41MDRjMCAzLjYwMi0yLjkwNiA2LjUxNy02LjQ5MiA2LjUxNy0zLjU4NCAwLTYuNDktMi45MTUtNi40OS02LjUxNyAwLTMuNTk2IDIuOTA2LTYuNTEzIDYuNDktNi41MTMgMy41ODYgMCA2LjQ5MiAyLjkxNyA2LjQ5MiA2LjUxMyIvPjxwYXRoIGZpbGw9IiMzZjM0MzgiIGQ9Im0zMy42MTkgMzIuNTA0YzAgMi40NzYtMS45OTggNC40ODEtNC40NjUgNC40ODEtMi40NjEgMC00LjQ2MS0yLjAxLTQuNDYxLTQuNDgxIDAtMi40NzQgMi00LjQ4IDQuNDYxLTQuNDggMi40NjcgMCA0LjQ2NSAyLjAxIDQuNDY1IDQuNDgiLz48ZWxsaXBzZSBmaWxsPSIjZmNmY2ZhIiBjeD0iMTQuODQ1IiBjeT0iMzIuNTA0IiByeD0iNS40MSIgcnk9IjUuNDMiLz48ZyBmaWxsPSIjM2YzNDM4Ij48ZWxsaXBzZSBjeD0iMTUuODU4IiBjeT0iMzIuNTA0IiByeD0iMy43MiIgcnk9IjMuNzM0Ii8+PHBhdGggZD0ibTM2LjMyIDE2LjkxMmMtNS40NzgtLjE0Ni04Ljc0NyAxLjg5NC0xMC4yOTEgNi4wMS0uMjIxLjU4OC43MDYuODMzLjk4Mi4yNzEgMS4yNzUtMi41ODggMy40NzUtNS41NjcgOS4zMDctNS4yNTIgMCAwIC4wMDEgMCAuMDAyIDAgLjYzNSAwIC42MzUtMS4wMjUgMC0xLjAyNSIvPjxwYXRoIGQ9Im0xNy44NDIgMjQuNjE1Yy0zLjc2OC0zLjkyNS03LjU0My00Ljc2MS0xMS41ODItMi45MzMtLjU3OC4yNjItLjA5NyAxLjA4Mi40OTkuODc5IDIuNzU4LS45NDEgNi40NDgtMS41MTQgMTAuMzQ2IDIuNzc4IDAgMCAuMDAxIDAgLjAwMiAwIC40NS40NDQgMS4xODQtLjI4LjczNS0uNzI0Ii8+PC9nPjwvc3ZnPg=='

// var SVG_SOURCE = 'data:image/svg+xml;charset=utf8,' + serializedSvg
var SVG_SOURCE = 'data:image/svg+xml;base64,' + base64Svg

function getSourceScale () {
  return width / 600
}

function init () {
  renderer = PIXI.autoDetectRenderer(1920, 1080, {
    transparent: true
  })

  stage = new PIXI.Container(0xFFFFFF)

  isWebGL = renderer instanceof PIXI.WebGLRenderer

  if (!isWebGL && !/MSIE 10/i.test(navigator.userAgent)) {
    renderer.context.mozImageSmoothingEnabled = false
    renderer.context.webkitImageSmoothingEnabled = false
  }

  /*
   * Fix for iOS GPU issues
   */
  renderer.view.style['transform'] = 'translatez(0)'

  document.body.appendChild(renderer.view)
  renderer.view.style.position = 'absolute'

  counter = document.createElement('div')
  counter.className = 'counter'
  counter.style.position = 'absolute'
  document.body.appendChild(counter)

  stats = new Stats()
  stats.domElement.style.position = 'absolute'
  stats.domElement.style.top = '0px'
  document.body.appendChild(stats.domElement)

  // eslint-disable-next-line new-cap
  beeTexture = new PIXI.Texture.fromImage(SVG_SOURCE, undefined, undefined, getSourceScale())

  container = new PIXI.particles.ParticleContainer(maxBees, [false, true, false, false, false])
  stage.addChild(container)

  for (var i = 0; i < startBeeCount; i++) {
    addBee(true)
  }

  beeTexture.baseTexture.on('loaded', function () {
    console.log('BeeTexture loaded')
    for (var i = 0; i < startBeeCount; i++) {
      addBee(true)
    }
  })

  document.addEventListener('touchstart', onTouchStart, true)
  document.addEventListener('touchstart', onTouchMove, true)
  document.addEventListener('touchend', onTouchEnd, true)

  document.addEventListener('mousedown', onMouseDown, true)
  document.addEventListener('mousemove', onMouseMove, true)
  document.addEventListener('mouseup', onMouseUp, true)
}

function addBee (randomPos) {
  var bee = new PIXI.Sprite(beeTexture)
  bee.position.x = randomPos ? (Math.random() * width) : mousePos.x
  bee.position.y = randomPos ? (Math.random() * height) : mousePos.y
  bee.speedX = (Math.random() - 0.5) * 10
  bee.speedY = (Math.random() - 0.5) * 10

  bee.accX = (Math.random() - 0.5) * 0.1
  bee.accY = (Math.random() - 0.5) * 0.1

  bee.anchor.y = 0.5
  bee.anchor.x = 0.5
  bee.scale.set(0.5 + Math.random() * 0.5)
  bees.push(bee)
  bee.rotation = (Math.random() - 0.5)
  container.addChild(bee)
  count++
}

function updateMousePos (event) {
  mousePos.x = event.clientX - offset.x
  mousePos.y = event.clientY - offset.y
}

function onTouchStart (event) {
  isAdding = true
  updateMousePos(event)
}

function onTouchMove (event) {
  if (isAdding) updateMousePos(event)
}

function onTouchEnd (event) {
  isAdding = false
}

function onMouseDown (event) {
  isAdding = true
  updateMousePos(event)
}

function onMouseMove (event) {
  if (isAdding) updateMousePos(event)
}

function onMouseUp (event) {
  isAdding = false
}

function resize () {
  if (animFrame) cancelAnimationFrame(animFrame)
  width = window.innerWidth
  height = window.innerHeight

  console.log('width, height', width, height)

  maxX = width
  minX = 0
  maxY = height
  minY = 0

  // renderer.view.style.left = '8px'
  // renderer.view.style.top = '8px'

  stats.domElement.style.left = '8px'
  stats.domElement.style.top = '8px'

  counter.style.left = '8px'
  counter.style.top = '60px'

  // Re-create texture
  container.removeChildren(false)
  beeTexture.destroy(true)
  bees = []

  // eslint-disable-next-line new-cap
  beeTexture = new PIXI.Texture.fromImage(SVG_SOURCE, undefined, undefined, getSourceScale())

  console.log('BeeTexture re-created')

  // Resize renderer
  renderer.resize(width, height)

  console.log('Renderer resized')

  beeTexture.baseTexture.on('loaded', function () {
    console.log('BeeTexture loaded')

    // Re-create old bees
    var oldCount = count
    count = 0
    for (var i = 0; i < oldCount; i++) {
      addBee(true)
    }
    update()
  })
}

function update () {
  stats.begin()
  var bee
  var i
  if (isAdding) {
    if (count < maxBees) {
      for (i = 0; i < amount; i++) {
        addBee()
      }
    }
    counter.innerHTML = count + ' BEES'
  }

  for (i = 0; i < bees.length; i++) {
    bee = bees[i]

    bee.position.x += bee.speedX
    bee.position.y += bee.speedY
    bee.speedX += bee.accX
    bee.speedY += bee.accY
    bee.accX += (Math.random() - 0.5) * 0.01
    bee.accY += (Math.random() - 0.5) * 0.01

    if (bee.position.x > maxX) {
      bee.speedX *= -1
      bee.position.x = maxX
    } else if (bee.position.x < minX) {
      bee.speedX *= -1
      bee.position.x = minX
    }

    if (bee.position.y > maxY) {
      bee.speedY *= -0.85
      bee.position.y = maxY
      bee.spin = (Math.random() - 0.5) * 0.2
      // if (Math.random() > 0.5) {
      //   bee.speedY -= Math.random() * 6
      // }
    } else if (bee.position.y < minY) {
      bee.speedY *= -0.85
      bee.position.y = minY
    }
  }

  renderer.render(stage)
  animFrame = requestAnimationFrame(update)
  stats.end()
}
