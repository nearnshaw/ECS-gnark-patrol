const point1 = new Vector3(5, 0, 5)
const point2 = new Vector3(5, 0, 15)
const point3 = new Vector3(15, 0, 15)
const point4 = new Vector3(15, 0, 5)

const myPath: Vector3[] = [point1, point2, point3, point4]

// how many frames to walk each path segment
const speed = 200

// how many frames to pause in between
const rest = 60

@Component("pathData")
export class PathData {
  previousPos: Vector3 = myPath[0]
  target: Vector3 = myPath[1]
  fraction: number = 0
  nextPathIndex: number = 1
  walking: boolean = true
  remainingRest: number = rest
}

export class PatrolPath {
  update() {
    let transform = gnark.get(Transform)
    let path = gnark.get(PathData)
    if (distance(transform.position, camera.position) < 2 && path.remainingRest > 0 ){
        path.walking = false     
        raiseDeadClip.play()
        walkClip.pause()
        transform.lookAt(camera.position)   
    }
   
    if (path.walking){
        if (path.fraction < 1) {
          transform.position = Vector3.Lerp(
            path.previousPos,
            path.target,
            path.fraction
            )
          path.fraction += 1 / speed
        } else{
          path.walking = false
          walkClip.pause()
          path.nextPathIndex += 1
          if (path.nextPathIndex >= myPath.length) {
              path.nextPathIndex = 0
          }
          path.previousPos = path.target
          path.target = myPath[path.nextPathIndex]
          turnRClip.play() 
          transform.lookAt(path.target)
        }
      }
      // if resting
      else
      {
        if (path.remainingRest > 0){
          path.remainingRest -= 1
        }
        else{
          path.remainingRest = rest
          path.walking = true
          walkClip.play()
          // if in corner, get the next target
          if (path.fraction >= 1){
            path.fraction = 0
          }   
          // turn Gnark in the direction of the next point
          transform.lookAt(path.target)
        }
      }
    }
}

engine.addSystem(new PatrolPath())

// Track user position and rotation
const camera = Camera.instance

// Add Gnark
let gnark = new Entity()
gnark.set(new Transform())
gnark.get(Transform).position.set(5, 0, 5)
gnark.get(Transform).scale.setAll(0.75)
gnark.set(new GLTFShape("models/gnark.gltf"))

// Add animations
const walkClip = new AnimationClip("walk")
const turnRClip = new AnimationClip("turnRight", {loop:false})
const raiseDeadClip = new AnimationClip("raiseDead", {loop:false})
gnark.get(GLTFShape).addClip(walkClip)
gnark.get(GLTFShape).addClip(turnRClip)
gnark.get(GLTFShape).addClip(raiseDeadClip)

// Activate walk animation
walkClip.play()

// add a path data component
gnark.set(new PathData())
//gnark.set(new RotateData())
gnark.get(Transform).rotation.setEuler(0, 0, 0)

// Add shark to engine
engine.addEntity(gnark)






///////////////

// Add 3D model for scenery
const castle = new Entity()
castle.add(new GLTFShape("models/Pirate_Ground.gltf"))
castle.add(new Transform())
castle.get(Transform).position.set(10, 0, 10)
//castle.get(Transform).scale.setAll(0.5)
engine.addEntity(castle)


// Get distance
/**
 * Note: It uses {x,z} not {x,y}. The y-coordinate is how high up it is.
 */
function distance(pos1: Vector3, pos2: Vector3): number {
  const a = pos1.x - pos2.x;
  const b = pos1.z - pos2.z;
  return Math.sqrt(a * a + b * b);
}