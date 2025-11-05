import React from 'react';
import Hero from '../components/Hero';
import FeaturesBanner from '../components/FeaturesBanner';
import BestSellers from '../components/BestSellers';
import ShopByCategory from '../components/ShopByCategory';
import Bundles from '../components/Bundles';
import WeKnowYourNeeds from '../components/WeKnowYourNeeds';

const Home = () => {
  return (
    <>
      <Hero />
      <FeaturesBanner />
      <BestSellers />
      <ShopByCategory />
      <Bundles />
      <WeKnowYourNeeds />
    </>
  );
};

export default Home;
