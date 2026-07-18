import gsap from 'gsap';

export function createCameraController(camera) {
  const lookAtTarget = { x: 0, y: 1, z: 0 };

  // The camera aims slightly to the left of the object's actual position.
  // Since the object itself doesn't move, this makes it render on the
  // right side of the screen instead of dead-center — keeping it clear
  // of the content panel, which sits on the left.
  const AIM_OFFSET_X = -2;

  function goTo(chapter, duration = 2, onComplete) {
    gsap.to(camera.position, {
      x: chapter.position.x,
      y: chapter.position.y,
      z: chapter.position.z,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(lookAtTarget, {
      x: chapter.lookAt.x + AIM_OFFSET_X,
      y: chapter.lookAt.y,
      z: chapter.lookAt.z,
      duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        camera.lookAt(lookAtTarget.x, lookAtTarget.y, lookAtTarget.z);
      },
      onComplete: () => {
        if (onComplete) onComplete();
      },
    });
  }

  return { goTo };
}
