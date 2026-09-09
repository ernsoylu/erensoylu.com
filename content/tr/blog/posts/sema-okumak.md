---
translationKey: reading-a-schematic
title: Elektrik mühendisi olmadan devre şeması okumak
subtitle: Başkasının tasarladığı kartı çalıştırması gereken yazılımcılar için bir yöntem.
date: 2026-06-09
tags:
  - hardware
  - embedded
  - notes
---
Gömülü yazılım geliştiriyorum. Arada bir masama bir kart, devre şeması, yarım
kalmış bir ilk çalıştırma belgesi ve şu soru geliyor: Sensör neden cevap
vermiyor? Bunu yanıtlamak için elektrik mühendisliği diplomasına ihtiyacınız
yok. Bir yönteme ihtiyacınız var.

## Köşeden değil, konektörden başlayın

Şemalar onları tasarlayan kişinin bakış açısıyla çizilir; çizimin sırası sizin
için her zaman anlamlı değildir. Sol üst köşeden başlamayın. Sorun yaşadığınız
bileşenden başlayıp dışarı doğru ilerleyin:

1. Bileşeni şemada **referans koduyla** (`U7`, `J3`) bulun.
2. Besleme pinlerini bulun. Besleme hattının adını not edin: `+3V3`, `VDDA`, `VBUS`.
3. O hattın regülatörünü bulun. Etkinleştirme pinini ve onu neyin sürdüğünü not edin.
4. Ancak bundan sonra ilgilendiğiniz sinyali takip edin.

Üçüncü adım, şaşırtıcı sayıda “çevre birimi çalışmıyor” hatasını yakalar.
Etkinleştirme pini bir GPIO'ya bağlı olan besleme hattı, yazılımınız onu açana
kadar kapalıdır.

## Asıl dizin, bağlantı adlarıdır

Her iletken bir **elektriksel bağlantıya (net)** aittir ve bu bağlantıların
adları vardır. İyi bir şema, farklı sayfalar da dahil olmak üzere bağlantının
geçtiği her yerde aynı adı kullanır. Sayfalar arası bağlantı okları da sırada
nereye bakacağınızı gösterir. PDF içinde arama yapabiliyorsanız `I2C1_SDA`
aramak, çizgileri imleçle takip etmekten daha hızlıdır.

Şu iki noktaya dikkat edin:

- **Veri yolları.** `SPI2_MOSI`, yalnızca `SPI2[0..3]` grubunun bir parçası
  olarak görünebilir. Pinin bağlı olmadığına karar vermeden önce veri yolu
  etiketinin hangi sinyalleri kapsadığını kontrol edin.
- **Bağlantı adları arasındaki köprüler.** Sıfır ohmluk bir direnç veya lehim
  köprüsüyle birleştirilen iki farklı ad, *köprü takılıysa* aynı elektriksel
  bağlantıyı ifade eder. Malzeme listesinde (BOM) “DNP” ibaresini arayın:
  “do not populate”, yani bileşeni takmayın. DNP işaretli bir direnç,
  gerçekte orada olmayan bir iletkendir.

## Pull-up dirençleri yapılandırmanın parçasıdır

I²C veri yolundaki pull-up dirençleri süs değildir; yükselme süresini,
dolayısıyla kullanılabilecek en yüksek saat hızını belirlerler. İki yaygın hata:

- **Hiç pull-up olmaması.** Tasarımcı, mikrodenetleyicinin dahili dirençlerine
  güvenmiştir. Dahili pull-up dirençleri genellikle onlarca kΩ değerindedir;
  400 kHz için fazla zayıf kalırlar.
- **İki kartta da pull-up olması.** Her birinde 4,7 kΩ direnç bulunan bir
  taşıyıcı kartla sensör kartını birleştirirseniz eşdeğer direnç 2,35 kΩ olur.
  Bazı bileşenler bu yük altında hattı yeterince düşük gerilime çekemez.

Veri yolu 100 kHz'de çalışıp 400 kHz'de çalışmıyorsa sürücüden önce pull-up
dirençlerinden şüphelenin.

## Yazılıma dokunmadan önce üç ölçüm

Bir multimetre ve beş dakikayla:

| Ölçüm | Beklenen | Yanlışsa olası neden |
| --- | --- | --- |
| Kart açıkken her besleme hattı | Nominal değerden en fazla birkaç yüzde sapma | Regülatör etkin değil veya kısa devre var |
| Boştayken reset pini | Boşta kalmamalı, besleme geriliminde tutulmalı | Pull-up eksik veya hata ayıklayıcı pini düşük seviyede tutuyor |
| Veri yolu boştayken SDA ve SCL | İkisi de besleme geriliminde | Pull-up eksik veya bir cihaz hattı düşük seviyede tutuyor |

En sık unuttuğum son satır. İşlemin ortasında takılan bir cihaz SDA'yı sürekli
düşük seviyede tutar. Sonraki bütün aktarımlar, tam bir sürücü hatasına benzeyen
şekilde başarısız olur. SCL üzerinden dokuz saat darbesi göndermek hattı
kurtarabilir; birçok üreticinin donanım soyutlama katmanında (HAL) tam da bunun
için bir `bus_recover()` işlevi bulunur.

## Edinmeye değer alışkanlık

Ne ölçtüğünüzü, nerede ve ne zaman ölçtüğünüzü şemadaki referansın yanına yazın:

```text
2026-06-08  rev B, seri no 004
  +3V3   3,29 V   tamam
  VDDA   0,00 V   -> U4'ün EN pini PA8'e bağlı; yazılım pini hiç sürmüyor. Düzeltildi.
  SDA    3,28 V   tamam (R21/R22 takılı, 4k7)
```

Altı ay sonra bu not, elinizde hangi kart revizyonunun olduğunu ve hangi
olasılıkları zaten elediğinizi anlatır. Kalibrasyon sabitlerini kod yerine
yapılandırmada tutmamın nedeni de aynı: Bağlamı olmayan bir ölçüm yalnızca
bir sayıdır.
