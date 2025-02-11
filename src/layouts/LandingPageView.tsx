import { NewNavBar } from '@/components/NavBar_LP'
import React from 'react'
import style from '../styles/module/page.module.css'
import Link from 'next/link'
import Image from 'next/image'
import { Footer } from '@/components/Footer'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faCode, faPenToSquare, faChartLine, faMoneyBill, faBullseye } from '@fortawesome/free-solid-svg-icons'

export default function LandingPageView() {
  const features = [
    {
      icon: faCopy,
      title: 'Clonar Landing Pages',
      description: 'Clonar qualquer landing page com precisão em segundos.',
    },
    {
      icon: faCode,
      title: 'Código-Fonte Pronto',
      description: 'Obter o código-fonte completo, pronto para personalização.',
    },
    {
      icon: faPenToSquare,
      title: 'Personalização Fácil',
      description: 'Personalizar facilmente, sem precisar de conhecimentos avançados em programação.',
    },
    {
      icon: faChartLine,
      title: 'Aumente Conversões',
      description: 'Aprimorar suas campanhas de marketing e aumentar suas conversões rapidamente.',
    },
    {
      icon: faMoneyBill,
      title: 'Hospedagem Gratuita',
      description: 'Publique suas páginas clonadas sem custos adicionais, de forma rápida e segura.',
    },
    {
      icon: faBullseye,
      title: 'Melhores Estratégias',
      description: 'Capture as melhores estratégias e implemente rapidamente.',
    },
  ]

  const steps = [
    {
      number: '1',
      title: 'Insira a URL da landing page',
      description: 'Insira a URL da landing page que deseja clonar na Copyei.',
    },
    { number: '2', title: 'Captura do código', description: 'Nossa tecnologia captura o código-fonte completo.' },
    { number: '3', title: 'Edite como quiser', description: 'Coloque o código em sua hospedagem e edite como quiser.' },
    { number: '4', title: 'Publique e dispare', description: 'Publique e dispare suas campanhas com a landing page!' },
  ]

  return (
    <>
      <NewNavBar />
      <div className={style.pageContainerLp}>
        <div className={style.containerLp}>
          <div className={style.bannerLp}>
            <div className={style.contentBanner}>
              <h1>Clone, Edite e Converta com Alta Performance 🚀</h1>
              <h2>
                A ferramenta definitiva para capturar, personalizar <br /> e lançar landing pages vencedoras.
              </h2>
              <Link href="/login" passHref>
                <button className={style.buttonLp}>Acessar</button>
              </Link>
            </div>
            <div className={style.imageBanner}>
              <Image
                src="/images/imagebanner.png"
                alt="Copyei"
                width={300}
                height={150}
                className={style.imageBannerLp}
              />
            </div>
          </div>
        </div>

        <div className={style.featuresSection}>
          <h2 className={style.featuresTitle}>Com nossa plataforma, você pode:</h2>
          <div className={style.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={style.featureCard}>
                <FontAwesomeIcon icon={feature.icon} size="2xs" className={style.featureIcon} />
                <h3 className={style.featureTitle}>{feature.title}</h3>
                <p className={style.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <section className={style.howItWorksSection}>
          <h2 className={style.howItWorksTitle}>Como funciona?</h2>
          <div className={style.stepsGrid}>
            {steps.map((step, index) => (
              <div key={index} className={style.stepCard}>
                <div className={style.stepNumber}>{step.number}</div>
                <h3 className={style.stepTitle}>{step.title}</h3>
                <p className={style.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </>
  )
}
