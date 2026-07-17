import gsap from 'gsap';

export function createCameraController(camera) {
  const lookAtTarget = { x: 0, y: 1, z: 0 };

  function goTo(chapter, duration = 2, onComplete) {
    gsap.to(camera.position, {
      x: chapter.position.x,
      y: chapter.position.y,
      z: chapter.position.z,
      duration,
      ease: 'power2.inOut',
    });
    gsap.to(lookAtTarget, {
      x: chapter.lookAt.x,
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