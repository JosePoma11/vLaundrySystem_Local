/* eslint-disable no-unused-vars */
import React from 'react';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import configParticles from './config-particles';

const ParticlesBackgound = () => {
  const particlesInit = useCallback((engine) => {
    loadFull(engine);
  }, []);

  return (
    <div>
      <Particles options={configParticles} init={particlesInit} />
    </div>
  );
};

export default ParticlesBackgound;
