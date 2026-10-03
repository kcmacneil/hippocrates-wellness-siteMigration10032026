# Live redirect audit

Every doc path in `content/*/` plus the Redirection-plugin sources (1,809 URLs) was requested on
https://hippocrateswellness.org/ with a trailing slash, without following redirects
(`tools/audit_live_redirects.py`). 170 answered with a redirect to a different URL; all were 301.

- **Added** to `content/redirects.json`: 153 off-site podcast redirects (podbean). These docs are
  still generated (same as `/home`, `/home-2` which also have docs) but the Next redirect wins;
  redirected paths are left out of `sitemap.xml`.
- **Added** 8 on-site redirects for pages the live site renamed/moved after the backup. Their
  targets were scraped from live into new docs by `tools/scrape_new_pages.py` (old docs untouched).
- The 8 Redirection-plugin rules (`/resilience` → `/integrative-health-education`, etc.) point at
  pages that **404 on the live site too** (not in the live sitemap), so they could not be migrated.

Non-redirect errors on live: 404 `/an-educational-lecture-with-dr-joshua-helman-md/`, `/group-campus-tour/`, `/october-2024/`; persistent 500 `/doctor-days-fall/`.

| Source | Live target | Status | Action | Note |
|---|---|---|---|---|
| `/a-conversation-with-stacey-malkin/` | https://hippocrates.podbean.com/e/a-conversation-with-stacey-malkin/ | 301 | **added** |  |
| `/a-journey-towards-health-and-wellness-with-shane-sterling/` | https://hippocrates.podbean.com/e/a-journey-towards-health-and-wellness/ | 301 | **added** |  |
| `/a-journey-towards-sustainable-living-with-will-and-madeline-tuttle/` | https://hippocrates.podbean.com/e/a-journey-towards-sustainable-living-with-will-and-madeline-taro/ | 301 | **added** |  |
| `/aaron-scanlan/` | https://hippocrates.podbean.com/e/aaron-scanlan/ | 301 | **added** |  |
| `/accommodation-categories/` | https://hippocrateswellness.org/the-resort/accommodation-categories/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/accommodation-categories/economy/` | https://hippocrateswellness.org/the-resort/accommodation-categories/economy/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/accommodation-categories/executive-suites/` | https://hippocrateswellness.org/the-resort/accommodation-categories/executive-suites/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/accommodation-categories/royal-palm-villas/` | https://hippocrateswellness.org/the-resort/accommodation-categories/royal-palm-villas/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/acuity/` | /cognitive-wellness-education | 301 | already present |  |
| `/aklya/` | https://hippocrates.podbean.com/e/aklya/ | 301 | **added** |  |
| `/alan-and-anthony/` | https://www.podbean.com/eu/pb-2uhbb-eb7eb7 | 301 | **added** |  |
| `/alan-goldhammer/` | https://hippocrates.podbean.com/e/alan-goldhamer/ | 301 | **added** |  |
| `/alana/` | https://hippocrates.podbean.com/e/alana/ | 301 | **added** |  |
| `/an-invigorating-discussion-with-marcy-newman/` | https://hippocrates.podbean.com/e/an-invigorating-discussion-with-mercy-newman/ | 301 | **added** |  |
| `/an-unwavering-journey-towards-natural-healing-with-sylvie-beljanski/` | https://hippocrates.podbean.com/e/an-unwavering-journey-towards-natural-healing-with-sylvie-beljanski/ | 301 | **added** |  |
| `/andy-roman-finding-inner-peace-in-a-chaotic-world/` | https://hippocrates.podbean.com/e/finding-inner-peace-in-a-chaotic-world/ | 301 | **added** |  |
| `/boris-glicksteins-revolutionary-journey-in-regenerative-medicine/` | https://hippocrates.podbean.com/e/boris-glicksteins-revolutionary-journey-in-regenerative-medicine/ | 301 | **added** |  |
| `/breaking-free-from-darkness-briannas-journey-of-healing/` | https://hippocrates.podbean.com/e/breaking-free-from-darkness-briannas-journey-of-healing/ | 301 | **added** |  |
| `/breast-cancer-testimonial/` | https://hippocrates.podbean.com/e/breast-cancer-testimonial/ | 301 | **added** |  |
| `/brian-clement-interviews-dr-rau-from-switzerland/` | https://hippocrates.podbean.com/e/brian-clement-interviews-dr-rau-from-switzerland/ | 301 | **added** |  |
| `/brian-clement-with-green-smoothie-girl/` | https://hippocrates.podbean.com/e/brian-clement-with-green-smoothie-girl/ | 301 | **added** |  |
| `/brianna-ladapo-healing-through-trauma/` | https://hippocrates.podbean.com/e/healing-through-trauma-a-journey-of-transformation/ | 301 | **added** |  |
| `/building-multigenerational-generational-health-2/` | https://hippocrateswellness.org/building-multigenerational-generational-health-october-4/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/cadence/` | /cardiovascular-wellness-education | 301 | already present |  |
| `/cancer/` | https://hippocrates.podbean.com/e/cancer-interview/ | 301 | **added** |  |
| `/cancer-and-psychoneuroimmunology/` | https://hippocrates.podbean.com/mf/play/9rxn2p/Hippocrates_for_5-2_Dr_Jan_W_FULL.mp3 | 301 | **added** |  |
| `/cbd-care/` | https://hippocrates.podbean.com/e/cbd-care/ | 301 | **added** |  |
| `/chef-aj/` | https://hippocrates.podbean.com/e/chef-aj/ | 301 | **added** |  |
| `/confronting-the-pharmaceutical-industry-with-dr-john-abramson/` | https://hippocrates.podbean.com/e/confronting-the-pharmaceutical-industry-with-dr-john-abramson/ | 301 | **added** |  |
| `/connections/` | https://hippocrates.podbean.com/e/connections-1546010104/ | 301 | **added** |  |
| `/covid-19/` | https://hippocrates.podbean.com/mf/play/tcyra9/Hippocrates_Program_4-12-Corona-Blum_Smatt_Shivani.mp3 | 301 | **added** |  |
| `/crohns-and-fibromyalgia/` | https://hippocrates.podbean.com/e/crohns-and-fibromyalgia/ | 301 | **added** |  |
| `/crohns-disease/` | https://hippocrates.podbean.com/e/crohns-disease-1556547281/ | 301 | **added** |  |
| `/david/` | https://hippocrates.podbean.com/e/brian-and-anna-with-david/ | 301 | **added** |  |
| `/defying-the-odds-a-journey-to-healing-and-empowerment-with-linda/` | https://hippocrates.podbean.com/e/defying-the-odds-a-journey-to-healing-and-empowerment/ | 301 | **added** |  |
| `/dick-robinson/` | https://hippocrates.podbean.com/e/dick-robinson/ | 301 | **added** |  |
| `/dr-dev/` | https://hippocrates.podbean.com/e/dr-dev/ | 301 | **added** |  |
| `/dr-dym/` | https://hippocrates.podbean.com/e/dr-dym-the-holistic-vet/ | 301 | **added** |  |
| `/dr-griffin/` | https://hippocrates.podbean.com/e/dr-griffin/ | 301 | **added** |  |
| `/dr-jan/` | https://hippocrates.podbean.com/e/dr-jan/ | 301 | **added** |  |
| `/dr-josh-hellman-on-reversing-alzheimers/` | https://hippocrates.podbean.com/e/reversing-alzheimers-the-science-of-hope/ | 301 | **added** |  |
| `/dr-levy/` | https://hippocrates.podbean.com/e/dr-levy/ | 301 | **added** |  |
| `/dr-porter-braintap/` | https://hippocrates.podbean.com/e/dr-porter-braintap/ | 301 | **added** |  |
| `/dr-rivky/` | https://hippocrates.podbean.com/e/dr-rivky/ | 301 | **added** |  |
| `/dr-silver-episode-1/` | https://hippocrates.podbean.com/e/transforming-health-with-dr-silver-surviving-cancer-heart-disease/ | 301 | **added** |  |
| `/dr-silver-episode-2/` | https://hippocrates.podbean.com/e/transforming-cancer-treatment-a-new-approach/ | 301 | **added** |  |
| `/dr-thomas/` | https://hippocrates.podbean.com/e/dr-thomas/ | 301 | **added** |  |
| `/dr-tostado/` | https://hippocrates.podbean.com/e/dr-tostado/ | 301 | **added** |  |
| `/emelia/` | https://hippocrates.podbean.com/e/emelia/ | 301 | **added** |  |
| `/emerging-from-darkness-healing-through-love-and-self-discovery/` | %20https://hippocrates.podbean.com/e/emerging-from-darkness-healing-through-love-and-self-discovery/ | 301 | **added** | live Location has a leading `%20` (broken); cleaned |
| `/empowering-health-a-journey-with-dr-pam-popper/` | https://hippocrates.podbean.com/e/empowering-health-a-journey-with-dr-pam-popper/ | 301 | **added** |  |
| `/energy-healing/` | https://hippocrates.podbean.com/e/energy-healing-1555342514/ | 301 | **added** |  |
| `/environmental-preservation/` | https://hippocrates.podbean.com/e/environmental-preservation/ | 301 | **added** |  |
| `/essentia-beds/` | https://hippocrates.podbean.com/e/essentia-beds/ | 301 | **added** |  |
| `/exclusive-qa-with-brian-clement/` | https://hippocrates.podbean.com/e/exclusive-qa-with-brian-clement/ | 301 | **added** |  |
| `/exploring-natural-dentistry-with-dr-huii/` | https://hippocrates.podbean.com/e/exploring-natural-dentistry-with-dr-hoy/ | 301 | **added** |  |
| `/fighting-advanced-stage-cancer-with-groundbreaking-treatment/` | https://hippocrates.podbean.com/e/fighting-advanced-stage-cancer-with-groundbreaking-hyperthermia-treatment/ | 301 | **added** |  |
| `/fortitude/` | /immune-health-education | 301 | already present |  |
| `/frank-pt-1/` | https://hippocrates.podbean.com/e/frank-pt-1/ | 301 | **added** |  |
| `/frank-pt-2/` | https://hippocrates.podbean.com/e/frank-part-2/ | 301 | **added** |  |
| `/from-cancer-to-cafe-gigis-journey-beyond-stage-4/` | https://hippocrates.podbean.com/e/from-cancer-to-cafe-gigis-journey-beyond-stage-4/ | 301 | **added** |  |
| `/from-darkness-to-wellness-atennas-inspiring-journey/` | https://hippocrates.podbean.com/e/from-darkness-to-wellness-atenas-inspiring-journey/ | 301 | **added** |  |
| `/from-diagnosis-to-empowerment-a-journey-of-healing-and-hope/` | https://hippocrates.podbean.com/e/from-diagnosis-to-empowerment-a-journey-of-healing-and-hope/ | 301 | **added** |  |
| `/from-finance-to-farm-lisas-transformational-journey/` | https://hippocrates.podbean.com/e/from-finance-to-farm-lisas-transformational-journey/ | 301 | **added** |  |
| `/from-healing-to-peak-performance-with-dr-ed-bice/` | https://hippocrates.podbean.com/e/from-healing-to-peak-performance-with-dr-ed-bice-and-dr-ed-weiss/ | 301 | **added** |  |
| `/from-struggles-to-success-a-journey-of-health-and-montessori-education/` | https://hippocrates.podbean.com/e/from-struggles-to-success-a-journey-of-health-and-montessori-education/ | 301 | **added** |  |
| `/from-the-caribbean-to-rwanda-a-judges-journey-of-justice-and-reconciliation/` | https://hippocrates.podbean.com/e/from-the-caribbean-to-rwanda-a-judges-journey-of-justice-and-reconciliation/ | 301 | **added** |  |
| `/from-tragedy-to-triumph-yairs-journey-of-resilience/` | https://hippocrates.podbean.com/e/from-tragedy-to-triumph-yairs-journey-of-resilience/ | 301 | **added** |  |
| `/genesis/` | /reproductive-wellness-education | 301 | already present |  |
| `/giles-and-the-power-of-the-respiratory-system/` | https://hippocrates.podbean.com/e/healing-at-hippocrates-health-institute-and-the-power-of-the-respiratory-system/ | 301 | **added** |  |
| `/greg/` | https://hippocrates.podbean.com/e/interview-with-greg/ | 301 | **added** |  |
| `/guest-testimonial-kidney-failure/` | https://hippocrates.podbean.com/e/guest-testimonial-kidney-failure/ | 301 | **added** |  |
| `/harnessing-frequency-for-wellness-enhancement/` | https://hippocrates.podbean.com/e/harnessing-frequency-for-wellness-enhancement/ | 301 | **added** |  |
| `/healing-beyond-conventional-methods-natalias-courageous-journey/` | https://hippocrates.podbean.com/e/healing-beyond-conventional-methods-natalias-courageous-journey/ | 301 | **added** |  |
| `/healing-from-colitis-ft-paul-nison/` | https://hippocrates.podbean.com/e/healing-journeys-from-colitis-to-wellness/ | 301 | **added** |  |
| `/healing-from-within-lianas-journey-to-wellness/` | https://hippocrates.podbean.com/e/healing-from-within-leanna-warner-grays-journey-to-wellness/ | 301 | **added** |  |
| `/healing-journeys-a-bridal-shop-owners-path-to-wellness/` | https://hippocrates.podbean.com/e/healing-journeys-a-bridal-shop-owners-path-to-wellness/ | 301 | **added** |  |
| `/healing-the-unseen-simons-journey-from-appendix-burst-to-cancer-warrior/` | https://hippocrates.podbean.com/e/healing-the-unseen-simons-journey-from-appendix-burst-to-cancer-warrior/ | 301 | **added** |  |
| `/healing-with-nature-a-legacy-of-cancer-reversal/` | https://hippocrates.podbean.com/e/healing-with-nature-a-legacy-of-cancer-reversal/ | 301 | **added** |  |
| `/health-challenges/weight-loss-2/` | https://hippocrateswellness.org/health-challenges/weight-loss/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/hennings-pt-1/` | https://hippocrates.podbean.com/e/henning-episode-1/ | 301 | **added** |  |
| `/hennings-pt-2/` | https://hippocrates.podbean.com/e/hennings-episode-2/ | 301 | **added** |  |
| `/hepatitis-c-and-liver-cancer/` | https://hippocrates.podbean.com/e/hepatitis-c-and-liver-cancer/ | 301 | **added** |  |
| `/home-2/` | https://hippocrateswellness.org/ | 301 | already present |  |
| `/integrative-internal-medicine-and-critical-care-nurse-practitioner-janice-dennis-aprn-fnp-c-ccrn/` | https://hippocrates.podbean.com/e/unveiling-the-truth-the-power-of-natural-medicine/ | 301 | **added** |  |
| `/interview-with-dr-esselstyn/` | https://hippocrates.podbean.com/e/interview-with-dr-esselstyn/ | 301 | **added** |  |
| `/interview-with-dr-smatt/` | https://hippocrates.podbean.com/e/interview-with-dr-smatt/ | 301 | **added** |  |
| `/interview-with-gail/` | https://hippocrates.podbean.com/e/interview-with-gail/ | 301 | **added** |  |
| `/interview-with-gary-p/` | https://hippocrates.podbean.com/e/gary-p/ | 301 | **added** |  |
| `/interview-with-jeff-rose/` | https://hippocrates.podbean.com/e/interview-with-jeff-rose/ | 301 | **added** |  |
| `/interview-with-jill-swyers/` | https://hippocrates.podbean.com/e/interview-with-jill-swyers/ | 301 | **added** |  |
| `/interview-with-kaia/` | https://www.podbean.com/eas/pb-sdwfu-13b0b4e | 301 | **added** |  |
| `/jason-k/` | https://hippocrates.podbean.com/e/jason-k/ | 301 | **added** |  |
| `/jim-poole/` | https://hippocrates.podbean.com/e/jim-poole/ | 301 | **added** |  |
| `/joe-from-farmers-table/` | https://www.podbean.com/ew/pb-uxt4n-fcfd87 | 301 | **added** |  |
| `/judy-plauge/` | https://hippocrates.podbean.com/e/judy-plauge/ | 301 | **added** |  |
| `/julia/` | https://hippocrates.podbean.com/e/julia-plant-based-chef/ | 301 | **added** |  |
| `/life-change-and-reversing-disease/` | https://hippocrates.podbean.com/e/life-change-and-reversing-disease/ | 301 | **added** |  |
| `/life-changing-testimonial/` | https://hippocrates.podbean.com/e/life-changing-testimonial/ | 301 | **added** |  |
| `/life-changing-testimonials/` | https://hippocrates.podbean.com/e/life-changing-testimonials/ | 301 | **added** |  |
| `/marla-maples/` | https://hippocrates.podbean.com/e/marla-maples/ | 301 | **added** |  |
| `/marlene/` | https://hippocrates.podbean.com/e/marlene/ | 301 | **added** |  |
| `/mary-beth/` | https://hippocrates.podbean.com/e/mary-beth/ | 301 | **added** |  |
| `/megan/` | https://hippocrates.podbean.com/e/megan/ | 301 | **added** |  |
| `/melanoma/` | https://hippocrates.podbean.com/e/melanoma-1562165627/ | 301 | **added** |  |
| `/melanoma-part-2/` | https://hippocrates.podbean.com/e/melanoma-part-2/ | 301 | **added** |  |
| `/michael-mirkrian/` | https://hippocrates.podbean.com/e/michael-mirkrian/ | 301 | **added** |  |
| `/michaels-inspiring-journey-of-resilience/` | https://hippocrates.podbean.com/e/michaels-inspiring-journey-of-resilience/ | 301 | **added** |  |
| `/mike-roizen/` | https://hippocrates.podbean.com/e/mike-roizen/ | 301 | **added** |  |
| `/mike-roizen-part-2/` | https://hippocrates.podbean.com/e/mike-roizen-part-2/ | 301 | **added** |  |
| `/miriam/` | https://hippocrates.podbean.com/e/miriam/ | 301 | **added** |  |
| `/navigating-natural-wellness-and-legislative-battles-featuring-julie-booras/` | https://hippocrates.podbean.com/e/unmasking-health-freedoms-navigating-natural-healing-and-legislative-battles/ | 301 | **added** |  |
| `/neha-gupta/` | https://hippocrates.podbean.com/e/neha-gupta/ | 301 | **added** |  |
| `/neil-jacobs-and-dr-jason-from-the-trihealth-clinic-in-toronto/` | https://hippocrates.podbean.com/e/transformative-healing-a-journey-with-hippocrates/ | 301 | **added** |  |
| `/nick-z-braintap/` | https://hippocrates.podbean.com/e/nick-z-braintap/ | 301 | **added** |  |
| `/ocean-robbins/` | https://hippocrates.podbean.com/e/ocean-robbins/ | 301 | **added** |  |
| `/paul-green-cancer-to-greenhouses/` | https://hippocrates.podbean.com/e/from-cancer-to-greenhouses-a-journey-of-healing-and-growth/ | 301 | **added** |  |
| `/plant-based-diets-and-athletic-performance-featuring-anna-clausen/` | https://hippocrates.podbean.com/e/a-health-transformation-journey/ | 301 | **added** |  |
| `/qa-exclusive-with-brian-clement-phd-ln/` | https://hippocrates.podbean.com/e/qa-exclusive-with-brian-clement-phd-ln/ | 301 | **added** |  |
| `/qa-with-brian-clement-phd-ln/` | https://hippocrates.podbean.com/e/qa-with-brian-clement-phd-ln/ | 301 | **added** |  |
| `/raw-love-fest/` | https://hippocrates.podbean.com/e/raw-love-fest/ | 301 | **added** |  |
| `/renata-krumers-inspring-battle-against-cancer/` | https://hippocrates.podbean.com/e/renata-krumers-inspring-battle-against-cancer | 301 | **added** |  |
| `/renewal/` | /metabolic-wellness-education | 301 | already present |  |
| `/representing-wellness-with-mike-causo/` | https://hippocrates.podbean.com/e/representing-wellness-with-mike-causo/ | 301 | **added** |  |
| `/resilience/` | /integrative-health-education | 301 | already present |  |
| `/restoration/` | /immune-resilience-education | 301 | already present |  |
| `/revealing-ayurvedas-ancient-wisdom-for-health-happiness-and-healing/` | https://hippocrates.podbean.com/e/revealing-ayurvedas-ancient-wisdom-for-health-happiness-and-healing/ | 301 | **added** |  |
| `/revolutionary-cancer-treatment-with-dr-z/` | https://hippocrates.podbean.com/e/revolutionary-cancer-treatment-with-dr-schischenberger/ | 301 | **added** |  |
| `/revolutionary-discussion-with-the-founder-of-braintap/` | https://hippocrates.podbean.com/e/an-in-depth-with-dr-patrick-porter/ | 301 | **added** |  |
| `/revolutionizing-health-empowering-yourself-with-dr-paul-marik/` | https://hippocrates.podbean.com/e/revolutionizing-health-empowering-yourself-with-dr-paul-merrick/ | 301 | **added** |  |
| `/revolutionizing-heart-health-insights-from-dr-heather-shenkman/` | https://hippocrates.podbean.com/e/revolutionizing-heart-health-insights-from-dr-heather-shankman/ | 301 | **added** |  |
| `/robin-quivers-pt-2/` | https://hippocrates.podbean.com/e/health-happiness-and-healing-robins-journey-with-howard-stern/ | 301 | **added** |  |
| `/root/` | /nervous-system-wellness-education | 301 | already present |  |
| `/sarah-and-the-how-foundation/` | https://hippocrates.podbean.com/e/sarah-and-the-how-foundation/ | 301 | **added** |  |
| `/sean-pt-1/` | https://hippocrates.podbean.com/e/sean-pt-1/ | 301 | **added** |  |
| `/sean-pt-2/` | https://hippocrates.podbean.com/e/sean-pt2/ | 301 | **added** |  |
| `/seth/` | https://hippocrates.podbean.com/e/interview-with-seth/ | 301 | **added** |  |
| `/soleara-and-adaptogenic-herbs/` | https://hippocrates.podbean.com/e/soleara-and-adaptogenic-herbs/ | 301 | **added** |  |
| `/spiritual-and-physical-wellness-journey-with-pastor-mercy-jones/` | https://hippocrates.podbean.com/e/spiritual-and-physical-wellness-journey-with-pastor-mercy-jones/ | 301 | **added** |  |
| `/stress-reduction/` | https://hippocrates.podbean.com/e/stress-reduction-1551808668/ | 301 | **added** |  |
| `/subscription-thank-you-page/` | https://hippocrateswellness.org/thank-you/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/tasha-chen/` | https://hippocrates.podbean.com/e/tasha-chen/ | 301 | **added** |  |
| `/testimonial-with-mark/` | https://hippocrates.podbean.com/e/testimonial-with-mark/ | 301 | **added** |  |
| `/the-dick-robinson-show-part-one/` | https://hippocrates.podbean.com/e/the-dick-robinson-show-part-one/ | 301 | **added** |  |
| `/the-dick-robinson-show-part-two/` | https://hippocrates.podbean.com/e/the-dick-robinson-show-part-two/ | 301 | **added** |  |
| `/the-food-forest-revolution-transforming-backyards-and-lives/` | https://hippocrates.podbean.com/e/the-food-forest-revolution-transforming-backyards-and-lives/ | 301 | **added** |  |
| `/the-healing-journey-of-dr-rocco/` | https://hippocrates.podbean.com/e/the-healing-journey-of-dr-rocco/ | 301 | **added** |  |
| `/the-healing-power-of-wellness-anna-marias-journey/` | https://hippocrates.podbean.com/e/the-healing-power-of-wellness-anna-marias-journey/ | 301 | **added** |  |
| `/the-influential-power-of-sound-frequencies-on-our-health-with-martha-prova/` | https://hippocrates.podbean.com/e/a-journey-to-wellness-with-hippocrates/ | 301 | **added** |  |
| `/the-power-of-fasting-transforming-health-and-healing/` | https://hippocrates.podbean.com/e/the-power-of-fasting-transforming-health-and-healing/ | 301 | **added** |  |
| `/the-radio-revolution-robin-quivers-on-life-with-howard-stern/` | https://hippocrates.podbean.com/e/the-radio-revolution-robin-quivers-on-life-with-howard-stern/ | 301 | **added** |  |
| `/the-resort-2/` | https://hippocrateswellness.org/the-resort/ | 301 | **added** — target page migrated from live (`tools/scrape_new_pages.py`) |  |
| `/the-yoga-show/` | https://hippocrates.podbean.com/e/the-yoga-show/ | 301 | **added** |  |
| `/torsten/` | https://hippocrates.podbean.com/e/torsten/ | 301 | **added** |  |
| `/transformative-wellness-with-roxane/` | https://hippocrates.podbean.com/e/transformative-wellness-roxanes-journey-from-engineer-to-health-advocate/ | 301 | **added** |  |
| `/unlocking-heart-health-the-power-of-metabolic-cardiology/` | https://hippocrates.podbean.com/e/unlocking-heart-health-the-power-of-metabolic-cardiology/ | 301 | **added** |  |
| `/unlocking-inner-peace-a-journey-within-with-andy-roman/` | https://hippocrates.podbean.com/e/unlocking-inner-peace-a-journey-within/ | 301 | **added** |  |
| `/unlocking-nature-communicating-with-plants/` | https://hippocrates.podbean.com/e/unlocking-nature-communicating-with-plants-at-hippocrates/ | 301 | **added** |  |
| `/unlocking-the-secrets-of-genetics-for-better-health/` | https://hippocrates.podbean.com/e/unlocking-the-secrets-of-genetics-for-better-health/ | 301 | **added** |  |
| `/unmasking-deception-with-dr-jane-ruby/` | https://hippocrates.podbean.com/e/unmasking-deception-health-freedom-and-controversial-truths/ | 301 | **added** |  |
| `/unmasking-the-truth-an-explosive-conversation-with-dr-judy-mikovits/` | https://hippocrates.podbean.com/e/unmasking-the-truth-an-explosive-conversation-with-dr-judy-mikovits/ | 301 | **added** |  |
| `/unraveling-the-connection-between-humans-nature-featuring-will-tuttle/` | https://hippocrates.podbean.com/e/unraveling-the-mystical-connection-between-humans-nature/ | 301 | **added** |  |
| `/unveiling-modern-approaches-in-progressive-oncology/` | https://hippocrates.podbean.com/e/unveiling-modern-approaches-in-progressive-oncology/ | 301 | **added** |  |
| `/unveiling-the-miracles-of-modern-medicine-with-dr-shalesh/` | https://hippocrates.podbean.com/e/unveiling-the-miracles-of-modern-medicine-with-dr-shalesh/ | 301 | **added** |  |
| `/unveiling-the-truth-navigating-modern-medicines-complexities/` | https://hippocrates.podbean.com/e/unveiling-the-truth-navigating-modern-medicines-complexities/ | 301 | **added** |  |
| `/upper-cervical-chiropractic/` | https://hippocrates.podbean.com/e/upper-cervical-chiropractic/ | 301 | **added** |  |
| `/weight-loss/` | https://hippocrates.podbean.com/e/weight-loss-1546009857/ | 301 | **added** |  |
| `/wendy-finkelstein-pa-c/` | https://hippocrates.podbean.com/e/wendy-finkelstein-pa-c/ | 301 | **added** |  |
| `/will-and-maddie-tuttle-embracing-a-plant-based-lifestyle/` | https://hippocrates.podbean.com/e/the-path-to-global-harmony-embracing-a-plant-based-lifestyle/ | 301 | **added** |  |
| `/zenon/` | https://hippocrates.podbean.com/e/zenon/ | 301 | **added** |  |
