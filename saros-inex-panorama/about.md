The [Saros-Inex Panorama](..) is an unique graph that shows the cyclical nature
of eclipses. The cyclical nature of eclipses arises from the conditions required
for an eclipse. For a solar eclipse, first the Moon must be near the New Moon
phase. The Moon's orbit however is inclined relative to the ecliptic of the
Solar System, so second, the Moon must be passing through the ecliptic.
Furthermore, the Moon's orbit is not a perfect circle, leading to some eclipses
being an annular eclipse, with others being a total eclipse. Each of these
can be tracked using a different lunar month.

- **[Synodic Month](https://en.wikipedia.org/wiki/Lunar_month#Synodic_month)**
The average time between one Moon phase and the same Moon phase in the next
lunar cycle (29 days, 12 hours, 44 minutes).
- **[Lunar Nodes](https://en.wikipedia.org/wiki/Lunar_node)**
The two points in the Moon’s orbit where it intersects the ecliptic of the
Solar System.
- **[Draconic Month](https://en.wikipedia.org/wiki/Lunar_month#Draconic_month)**
The average time it takes the Moon to orbit from one node to the same node
(27 days, 5 hours, 6 minutes).
- **[Apsis](https://en.wikipedia.org/wiki/Apsis)**
A point of extreme in an orbit, ie. the closest or furthest point of the Moon
from the Earth.
- **[Anomalistic Month](https://en.wikipedia.org/wiki/Lunar_month#Anomalistic_month)**
The average time it takes the Moon to orbit from one apsis to the same apsis
(27 days, 13 hours, 19 minutes).

Each of these lunar months have a different period. An eclipse happens when
specifically the synodic and draconic months line up. If the anomalistic month
also lines up, we then know that it will be the same type of eclipse.
Unfortunate they don't perfectly line up, but they do come close every 6
synodic months, which is about 6 1/2 draconic months. This is the amount of
time that occurred between the October 2023 Annular Eclipse and the April 2024
Total Eclipse. This is not exact, so a solar eclipse won't happen every six
months.

Even closer, every 223 synodic months is just under 242 draconic months and just
under 239 anomalistic months. This period of time is called a saros. This means
if a solar eclipse happens on a given date, one saros later, a similar solar
eclipse will likely happen again some where on Earth. This isn't exact, but you
can expect about 70 eclipses, each 223 synodic months apart, in what is called
a saros series. Every saros during the series, the draconic and less so the
anomalistic months will drift, with the first and last several being only
partial eclipses visible in the polar regions. Multiple saros series will be
progressing at any given time.

There are many other eclipse cycles, but the second most interesting, especially
when talking about the saros is the inex. Every 358 synodic months is very close
to 388 1/2 draconic months. Also an eclipse one inex later will be in the next
saros series, and vise versa, making it straight forward to graph, creating the
saros-inex panorama.

### Data Source

The primary data source for my interactive saros-inex panorama is
[NASA's Five Millennium Catalog of Solar Eclipses](https://eclipse.gsfc.nasa.gov/).
I was able to add more eclipses to the panorama with a python script I wrote.
The images shown in the corner are also from NASA's Eclipse Website when
available. I hope to in the future improve my python script to predict more
eclipses and generate my own images.

### Other cycles in the Saros-Inex panorama

An interesting thing also begins to occur when you look at certain multiple
combinations of saros and inexes. For example if you subtract 8 saros from
5 inexes, you will get 6 synodic months.

$$5 \times 358 - 8 \times 223 = 1790 - 1784 = 6$$

This means that if you find the October 2023 eclipse on the panorama, go to
right 5 columns, then up 8 rows, you will find the April 2024 eclipse. You can
find other formulas for other eclipse cycles on
[Wikipedia](https://en.wikipedia.org/wiki/Eclipse_cycle#Eclipse_cycles).
