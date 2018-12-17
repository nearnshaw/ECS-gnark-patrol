const point1 = new Vector3(5, 0, 5)
const point2 = new Vector3(5, 0, 15)
const point3 = new Vector3(15, 0, 15)
const point4 = new Vector3(15, 0, 5)

const myPath: Vector3[] = [point1, point2, point3, point4]

@Component('lerpData')
export class LerpData {
  previousPos: Vector3 = myPath[0]
  target: Vector3 = myPath[1]
  fraction: number = 0
  nextPathIndex: number = 1
  turnTime: number = 0.8
}

export class PatrolPath {
  update(dt: number) {
    let transform = gnark.get(Transform)
    let path = gnark.get(LerpData)

    if (walkClip.playing) {
      if (path.fraction < 1) {
        path.fraction += dt / 6
        transform.position = Vector3.Lerp(
          path.previousPos,
          path.target,
          path.fraction
        )
      } else {
        walkClip.pause()
        turnRClip.play()
        path.previousPos = path.target
        path.nextPathIndex += 1
        if (path.nextPathIndex >= myPath.length) {
          path.nextPathIndex = 0
        }
        path.target = myPath[path.nextPathIndex]
        transform.lookAt(path.target)
      }
    }
    else if (turnRClip.playing) {
      if (path.turnTime > 0) {
        path.turnTime -= dt
      } else {
        path.turnTime = 0.8
        walkClip.play()
        path.fraction = 0
      }
    }
  }
}

engine.addSystem(new PatrolPath())

export class BattleCry {
  update() {
    let transform = gnark.get(Transform)
    let path = gnark.get(LerpData)
    let dist = distance(transform.position, camera.position)
    if ( dist < 4) {
      raiseDeadClip.play()
      walkClip.pause()
      turnRClip.pause()
      transform.lookAt(camera.position)
    }
    else if (raiseDeadClip.playing){
      raiseDeadClip.pause()
      walkClip.play()
      transform.lookAt(path.target)
    }
  }
}

engine.addSystem(new BattleCry())

// Track user position and rotation
const camera = Camera.instance

// Add Gnark
let gnark = new Entity()
gnark.set(new Transform())
gnark.get(Transform).position.set(5, 0, 5)
gnark.get(Transform).scale.setAll(0.75)
gnark.set(new GLTFShape('models/gnark.gltf'))

// Add animations
const walkClip = new AnimationClip('walk', { speed: 1 })
const turnRClip = new AnimationClip('turnRight', { loop: false })
const raiseDeadClip = new AnimationClip('raiseDead')
gnark.get(GLTFShape).addClip(walkClip)
gnark.get(GLTFShape).addClip(turnRClip)
gnark.get(GLTFShape).addClip(raiseDeadClip)

// Activate walk animation
walkClip.play()

// add a path data component
gnark.set(new LerpData())
//gnark.set(new RotateData())
gnark.get(Transform).rotation.setEuler(0, 0, 0)

// Add shark to engine
engine.addEntity(gnark)

///////////////

// Add 3D model for scenery
const castle = new Entity()
castle.add(new GLTFShape('models/Pirate_Ground.gltf'))
castle.add(new Transform())
castle.get(Transform).position.set(10, 0, 10)
//castle.get(Transform).scale.setAll(0.5)
engine.addEntity(castle)

// Get distance
/**
 * Note: It uses {x,z} not {x,y}. The y-coordinate is how high up it is.
 */
function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x
  const b = pos1.z - pos2.z
  return Math.sqrt(a * a + b * b)
}
