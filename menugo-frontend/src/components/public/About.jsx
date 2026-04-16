import React from 'react';
import { motion } from 'framer-motion';
import {
  staggerContainer,
  fadeInUp,
  popIn,
  hoverLift,
  fadeInDown,
  heroImage,
  subtleFloat,
} from '../common/motionVariants'
import { 
  CheckBadgeIcon, 
  RocketLaunchIcon,
  UsersIcon,
  GlobeAltIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
const About = () => {
  const values = [
    {
      icon: HeartIcon,
      title: 'Customer First',
      description: 'We put our customers at the heart of everything we do.',
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'Constantly innovating to bring the best solutions.',
    },
    {
      icon: UsersIcon,
      title: 'Collaboration',
      description: 'Working together to achieve great results.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Impact',
      description: 'Making a difference in restaurants worldwide.',
    },
  ];

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1545996124-1f3a0e9d7b8d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Michael Chen',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Emily Davis',
      role: 'Customer Success',
      image: 'https://images.unsplash.com/photo-1541534401786-5f9a3a7ca2f6?auto=format&fit=crop&w=400&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}<PublicHeader />
      <section className="pt-32 pb-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <motion.h1 variants={fadeInDown} className="text-4xl md:text-5xl font-bold text-white mb-4">About MenuGo</motion.h1>
            <motion.p variants={fadeInDown} className="text-xl text-primary-100 max-w-3xl mx-auto">
              We're on a mission to revolutionize the restaurant industry with cutting-edge digital solutions.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
              <div className="w-20 h-1 bg-primary-600 mb-6"></div>
              <p className="text-gray-600 mb-4">
                Founded in 2024, MenuGo was born from a simple idea: to make restaurant menus digital, 
                accessible, and easy to manage. We saw restaurant owners struggling with printing costs, 
                outdated menus, and inefficient ordering systems.
              </p>
              <p className="text-gray-600 mb-4">
                Today, MenuGo has grown into a comprehensive platform serving thousands of restaurants 
                worldwide. Our team is passionate about using technology to solve real-world problems 
                in the food service industry.
              </p>
              <p className="text-gray-600">
                We believe that great food deserves great technology. That's why we're committed to 
                providing the best digital menu solution for restaurants of all sizes.
              </p>
            </motion.div>
            <motion.div variants={heroImage} initial="hidden" whileInView="show" viewport={{ once: true }} className="relative">
              <motion.img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80"
                alt="Our Story"
                className="w-full h-auto rounded-2xl shadow-xl"
                whileHover={{ scale: 1.02, y: -6 }}
                transition={{ duration: 0.32 }}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={subtleFloat} initial="hidden" whileInView="show" viewport={{ once: true }} className="bg-white rounded-xl shadow-lg p-8 text-center" {...hoverLift}>
              <RocketLaunchIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Mission</h3>
              <p className="text-gray-600">
                To empower restaurants with innovative digital solutions that enhance customer experience, 
                reduce costs, and drive growth.
              </p>
            </motion.div>
            <motion.div variants={subtleFloat} initial="hidden" whileInView="show" transition={{ delay: 0.12 }} viewport={{ once: true }} className="bg-white rounded-xl shadow-lg p-8 text-center" {...hoverLift}>
              <GlobeAltIcon className="w-16 h-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Our Vision</h3>
              <p className="text-gray-600">
                To become the world's leading digital menu platform, connecting restaurants and diners 
                seamlessly through technology.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our Values</h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.06 }}
                className="text-center"
                {...hoverLift}
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Meet Our Team</h2>
            <div className="w-20 h-1 bg-primary-600 mx-auto mt-4 mb-6"></div>
            <p className="text-lg text-gray-600">
              Passionate people dedicated to your success
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                variants={popIn}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.15 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden text-center"
                {...hoverLift}
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-primary-600 text-sm">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Our Journey
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-primary-100 mb-8">
            Be part of the digital restaurant revolution
          </motion.p>
          <motion.a
            href="/contact"
            variants={popIn}
            initial="hidden"
            whileInView="show"
            whileHover={{ scale: 1.03 }}
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
          >
            Get in Touch
          </motion.a>
        </div>
      </section>
      <PublicFooter />
    </div>
  );
};

export default About;