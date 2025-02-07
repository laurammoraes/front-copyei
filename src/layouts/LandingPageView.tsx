import { NewNavBar } from "@/components/NavBar_LP";
import style from '../styles/module/page.module.css'
import Link from "next/link";
import Image from 'next/image';

export default function LandingPageView() {
    return(
        <>
        <NewNavBar/>
        <div className={style.pageContainerLp}>
            <div className={style.containerLp}>
                <div className={style.bannerLp}>
                    <div className={style.contentBanner}>
                        <h2>Clone, personalize e converta: a <br />melhor ferramenta de clonagem <br /> de alta performance</h2>
                        <h4>Capture as melhores estratégias do mercado com um clique.<br /> Obtenha o código-fonte personalizável e adapte à sua<br /> estratégia de marketing digital.</h4>
                        <Link href="/login" passHref><button className={style.buttonLp}>Acessar</button></Link>
                    </div>
                    <div className={style.imageBanner}>
                    <Image
                        src="/images/imagebanner.png"
                        alt="Copyei"
                        fill
                        sizes="(max-width: 768px) 100vw, 
                                (max-width: 1200px) 50vw, 
                                33vw"
                        priority
                        style={{ objectFit: 'contain' }}
                        className={style.imageBannerLp}
                        />
                    </div>
                </div>
            </div>
        </div>  
        </>
    )
}