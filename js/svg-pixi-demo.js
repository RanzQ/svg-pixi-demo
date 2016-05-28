var $ = window.jQuery
var PIXI = window.PIXI
var Stats = window.Stats
var requestAnimationFrame = window.requestAnimationFrame
var cancelAnimationFrame = window.cancelAnimationFrame

$(document).ready(onReady)

$(window).resize(delayedResize)
window.onorientationchange = delayedResize

var resizeRequest

function delayedResize () {
  if (resizeRequest) clearTimeout(resizeRequest)
  resizeRequest = setTimeout(resize, 500)
}

var width
var height

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
  animFrame = requestAnimationFrame(update)
}

function init () {
  renderer = PIXI.autoDetectRenderer(1920, 1080, {
    backgroundColor: 0xFFFFFF
  })
  stage = new PIXI.Container(0xFFFFFF)

  isWebGL = renderer instanceof PIXI.WebGLRenderer

  if (!isWebGL) {
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

  beeTexture = new PIXI.Texture.fromImage('bee.svg', undefined, undefined, 1.0)

  container = new PIXI.particles.ParticleContainer(maxBees, [false, true, false, false, false])
  stage.addChild(container)

  for (var i = 0; i < startBeeCount; i++) {
    addBee(true)
  }

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
  cancelAnimationFrame(animFrame)
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

  beeTexture = new PIXI.Texture.fromImage('bee.svg', undefined, undefined, width / 600)

  console.log('beeTexture', beeTexture)

  // Resize renderer
  renderer.resize(width, height)

  // Add new bees
  var oldCount = count
  count = 0
  for (var i = 0; i < oldCount; i++) {
    addBee(true)
  }
  animFrame = requestAnimationFrame(update)
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
