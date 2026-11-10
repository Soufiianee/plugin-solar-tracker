# Compatibility audit (live model)

Generated 2026-11-10 by `npm run compat-audit`. This is what the site shows.

Codes: **OK** Compatible · **LIKELY** Likely compatible: confirm with seller · **COMPONENT** Component certificate only: check with seller · **CLAIMED** Listing claimed, no certificate seen · **3700-CLAIM** UL 3700 claimed, no certificate seen · **NO** Not certified · **NONE** No certification evidence found · **OUT?** Output not stated by seller · **OVER** Over this state’s size limit · **RULES?** State rules not yet verified. `*` = "check device count" caveat (one device/system per meter).

## Matrix

| Kit | CA | CO | CT | MD | ME | NH | NJ | UT | VA | VT |
|---|---|---|---|---|---|---|---|---|---|---|
| APsystems EZ1-LV plug-in microinverter | COMPONENT | LIKELY | LIKELY | LIKELY | COMPONENT | RULES? | COMPONENT | LIKELY | LIKELY | COMPONENT |
| EcoFlow STREAM Microinverter | NONE | CLAIMED | CLAIMED | CLAIMED | NONE | RULES? | NONE | CLAIMED | CLAIMED | NONE |
| EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | NONE | CLAIMED | CLAIMED | CLAIMED | NONE | RULES? | NONE | CLAIMED | CLAIMED | NONE |
| EcoFlow STREAM Ultra | NONE | NONE | NONE | NONE | NONE | RULES? | NONE | NONE | NONE | NONE |
| Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 3700-CLAIM | CLAIMED | CLAIMED | CLAIMED | 3700-CLAIM | RULES? | 3700-CLAIM | CLAIMED | CLAIMED | 3700-CLAIM |
| Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 3700-CLAIM | CLAIMED | CLAIMED | CLAIMED | 3700-CLAIM | RULES? | 3700-CLAIM | CLAIMED | CLAIMED | 3700-CLAIM |
| Bright Saver Balcony Solar Kit, 180 W | NO | CLAIMED | CLAIMED | CLAIMED | NO | RULES? | NO | CLAIMED | CLAIMED | NO |
| Bright Saver Balcony Solar Kit, 360 W | NO | CLAIMED | CLAIMED* | CLAIMED* | NO | RULES? | NO | CLAIMED | CLAIMED | NO |
| CraftStrom 800 Watt Plug&Play Solar | NONE | CLAIMED | CLAIMED* | CLAIMED* | NONE | RULES? | NONE | CLAIMED | CLAIMED | NONE |
| CraftStrom 1200 Watt Plug&Play Solar | NONE | CLAIMED | CLAIMED* | CLAIMED* | NONE | RULES? | NONE | CLAIMED | CLAIMED | NONE |

## Rule per state

- **CA** (UL 3700 / complete-system): Must be certified as a plug-in photovoltaic system by UL or an equivalent NRTL, with a certified isolation feature, and meet the NEC and California Electrical Code (8530(c)(4)-(6)). From January 1, 2030, plug-in devices that do not meet these conditions may not be sold in California (8532).
- **CO** (lab-listed): Device must be labeled and listed by a nationally recognized testing laboratory. From January 1, 2027, no device over 391 watts may be sold, leased or rented in Colorado unless UL labeled and listed. Devices up to 391 watts are exempt from rewiring-related listing provisions (40-2-140(1)(e)(II), (5), (6)).
- **CT** (lab-listed): Must be certified by UL or an equivalent NRTL and meet UL 1741, plus the State Building Code, NEC and IEEE 1547 (Sec. 9(a)(5)-(7)).
- **MD** (lab-listed): Must be certified by Underwriters Laboratory or an equivalent NRTL (7-321(a)(4)). A system with output to the outlet of 391 watts or less is exempt from listing provisions that would require alterations to the premises, wiring or panels (7-321(f)).
- **ME** (UL 3700 / complete-system): Eligible systems are listed or certified to UL 3700, to a comparable NRTL standard, or configured per the National Electrical Code adopted by the Electricians' Examining Board (3475(1)(A)). Inverters must shut off within 0.2 seconds if power is disrupted.
- **NH** (not verified): Not confirmed on a primary source. The mirror copy of Chapter 262 says: certified by an NRTL to nationally recognized safety standards for DERs and plug-in systems (362-A:10, I).
- **NJ** (UL 3700 / complete-system): Listed or certified to UL 3700, a comparable standard, or a combination of standards covering plug-in safety and grid-parallel operation, by an NRTL (Sec. 2(a)). Devices of 400 watts or less to the outlet are exempt from provisions requiring alterations (Sec. 2(e)).
- **UT** (lab-listed): Device must be certified by Underwriters Laboratories or an equivalent nationally recognized testing laboratory, meet the most recent National Electrical Code, and connect through a standard 120-volt outlet (54-15-102(13)). No specific standard is named.
- **VA** (lab-listed): Certified by an NRTL (29 C.F.R. 1910.7) or equivalent and compliant with the NEC. Devices with 391 watts or less to the outlet are exempt from listing provisions that would require alterations (56-596.7(A)).
- **VT** (UL 3700 / complete-system): Device must comply with UL 3700 (or an equivalent certification by an equivalent NRTL) and IEEE 1547-2018 (30 V.S.A. 201(9)(C)). It may only be connected where the building has a smart meter (256(a)).

## Label meanings

- **Compatible**: Within the size limit, and we have seen a certificate covering the complete system.
- **Likely compatible: confirm with seller**: Within the size limit, and we have seen a lab certificate for the kit’s inverter. The law asks for lab certification without naming a standard, so confirm with the seller that the whole kit qualifies.
- **Component certificate only: check with seller**: This state requires UL 3700 (or complete-system certification). The certificate we have seen covers only one part, such as the inverter, so ask the seller whether the complete kit is certified.
- **Listing claimed, no certificate seen**: The maker says the product is lab-listed (for example to UL 1741), but we have not seen a certificate.
- **UL 3700 claimed, no certificate seen**: The maker says the product meets UL 3700, but we have not seen a certificate.
- **Not certified**: The maker or seller says it is not certified to the standard this state requires.
- **No certification evidence found**: We found no certificate and no claim for the certification this state requires.
- **Output not stated by seller**: The seller does not state the AC output, so we cannot check it against the limit.
- **Over this state’s size limit**: The seller’s stated output is above this state’s legal limit.
- **State rules not yet verified**: We have not yet confirmed this state’s rules on an official source.
- **No state plug-in law**: This state has no plug-in solar law; your utility’s interconnection rules apply.

## Every state × kit

| State | Kit | AC W | Verdict | Basis (evidence) | Caveats |
|---|---|---|---|---|---|
| CA | APsystems EZ1-LV plug-in microinverter | 900 | **Component certificate only: check with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| CO | APsystems EZ1-LV plug-in microinverter | 900 | **Likely compatible: confirm with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| CT | APsystems EZ1-LV plug-in microinverter | 900 | **Likely compatible: confirm with seller** | UL 1741 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| MD | APsystems EZ1-LV plug-in microinverter | 900 | **Likely compatible: confirm with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| ME | APsystems EZ1-LV plug-in microinverter | 900 | **Component certificate only: check with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| NH | APsystems EZ1-LV plug-in microinverter | 900 | **State rules not yet verified** | — | — |
| NJ | APsystems EZ1-LV plug-in microinverter | 900 | **Component certificate only: check with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| UT | APsystems EZ1-LV plug-in microinverter | 900 | **Likely compatible: confirm with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| VA | APsystems EZ1-LV plug-in microinverter | 900 | **Likely compatible: confirm with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| VT | APsystems EZ1-LV plug-in microinverter | 900 | **Component certificate only: check with seller** | UL 3700 certified (component) [evidence](https://usa.apsystems.com/document/ez1-certifications/) | — |
| CA | EcoFlow STREAM Microinverter | 1200 | **No certification evidence found** | — | — |
| CO | EcoFlow STREAM Microinverter | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| CT | EcoFlow STREAM Microinverter | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| MD | EcoFlow STREAM Microinverter | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| ME | EcoFlow STREAM Microinverter | 1200 | **No certification evidence found** | — | — |
| NH | EcoFlow STREAM Microinverter | 1200 | **State rules not yet verified** | — | — |
| NJ | EcoFlow STREAM Microinverter | 1200 | **No certification evidence found** | — | — |
| UT | EcoFlow STREAM Microinverter | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| VA | EcoFlow STREAM Microinverter | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| VT | EcoFlow STREAM Microinverter | 1200 | **No certification evidence found** | — | — |
| CA | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **No certification evidence found** | — | — |
| CO | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| CT | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| MD | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| ME | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **No certification evidence found** | — | — |
| NH | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **State rules not yet verified** | — | — |
| NJ | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **No certification evidence found** | — | — |
| UT | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| VA | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://us.ecoflow.com/products/stream-microinverter) | — |
| VT | EcoFlow STREAM Microinverter + 2 x 400W Rigid Solar Panels | 1200 | **No certification evidence found** | — | — |
| CA | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| CO | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| CT | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| MD | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| ME | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| NH | EcoFlow STREAM Ultra | 800 | **State rules not yet verified** | — | — |
| NJ | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| UT | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| VA | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| VT | EcoFlow STREAM Ultra | 800 | **No certification evidence found** | — | — |
| CA | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| CO | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| CT | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | — |
| MD | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| ME | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| NH | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **State rules not yet verified** | — | — |
| NJ | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| UT | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| VA | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| VT | Hoymiles HiFlow Pro LV HMS-391-1WM-LV | 391 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| CA | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| CO | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| CT | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | — |
| MD | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| ME | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| NH | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **State rules not yet verified** | — | — |
| NJ | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| UT | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| VA | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **Listing claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| VT | Hoymiles HiFlow Pro LV HMS-420-1WM-LV | 420 | **UL 3700 claimed, no certificate seen** | UL 3700 pending_or_claimed (component) [evidence](https://www.hoymiles.com/product-release/hoymiles-introduces-hiflow-pro-the-first-ul-3700-compliant-plug-in-microinverter-in-the-us-to-boost-diy-solar.html) | — |
| CA | Bright Saver Balcony Solar Kit, 180 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| CO | Bright Saver Balcony Solar Kit, 180 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| CT | Bright Saver Balcony Solar Kit, 180 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| MD | Bright Saver Balcony Solar Kit, 180 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| ME | Bright Saver Balcony Solar Kit, 180 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| NH | Bright Saver Balcony Solar Kit, 180 W | unknown | **State rules not yet verified** | — | — |
| NJ | Bright Saver Balcony Solar Kit, 180 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| UT | Bright Saver Balcony Solar Kit, 180 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| VA | Bright Saver Balcony Solar Kit, 180 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| VT | Bright Saver Balcony Solar Kit, 180 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 180 W, so it cannot exceed the limit. |
| CA | Bright Saver Balcony Solar Kit, 360 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| CO | Bright Saver Balcony Solar Kit, 360 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| CT | Bright Saver Balcony Solar Kit, 360 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. Check device count: Connecticut allows one device behind each meter; this product has an unstated number of inverters. |
| MD | Bright Saver Balcony Solar Kit, 360 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. Check device count: Maryland allows one system per electric meter; this product has an unstated number of inverters. |
| ME | Bright Saver Balcony Solar Kit, 360 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| NH | Bright Saver Balcony Solar Kit, 360 W | unknown | **State rules not yet verified** | — | — |
| NJ | Bright Saver Balcony Solar Kit, 360 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| UT | Bright Saver Balcony Solar Kit, 360 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| VA | Bright Saver Balcony Solar Kit, 360 W | unknown | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://www.hoymiles.com/uploadfile/1/202607/76ba93c782.pdf) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| VT | Bright Saver Balcony Solar Kit, 360 W | unknown | **Not certified** | UL 3700 not_certified (complete_system) [evidence](https://www.brightsaver.org/balcony-solar-kits) | Output not stated, but its panels total 360 W, so it cannot exceed the limit. |
| CA | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **No certification evidence found** | — | — |
| CO | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/800-watt-plugplay-solar/) | — |
| CT | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/800-watt-plugplay-solar/) | Check device count: Connecticut allows one device behind each meter; this product has 2 inverters. |
| MD | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/800-watt-plugplay-solar/) | Check device count: Maryland allows one system per electric meter; this product has 2 inverters. |
| ME | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **No certification evidence found** | — | — |
| NH | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **State rules not yet verified** | — | — |
| NJ | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **No certification evidence found** | — | — |
| UT | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/800-watt-plugplay-solar/) | — |
| VA | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/800-watt-plugplay-solar/) | — |
| VT | CraftStrom 800 Watt Plug&Play Solar | 700 (est.) | **No certification evidence found** | — | — |
| CA | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **No certification evidence found** | — | — |
| CO | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/1200-watt-plugplay-solar/) | — |
| CT | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/1200-watt-plugplay-solar/) | Check device count: Connecticut allows one device behind each meter; this product has 3 inverters. |
| MD | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/1200-watt-plugplay-solar/) | Check device count: Maryland allows one system per electric meter; this product has 3 inverters. |
| ME | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **No certification evidence found** | — | — |
| NH | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **State rules not yet verified** | — | — |
| NJ | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **No certification evidence found** | — | — |
| UT | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/1200-watt-plugplay-solar/) | — |
| VA | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **Listing claimed, no certificate seen** | UL 1741 pending_or_claimed (component) [evidence](https://craftstrom.com/product/1200-watt-plugplay-solar/) | — |
| VT | CraftStrom 1200 Watt Plug&Play Solar | 1050 (est.) | **No certification evidence found** | — | — |
