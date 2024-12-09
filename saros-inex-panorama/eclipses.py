import math
import numpy as np
from skyfield.api import load
from skyfield import almanac
from datetime import datetime, timedelta, UTC
import json
import sqlite3

# eph = load('de421.bsp')
eph = load('de441.bsp')
earth = eph['earth']
sun = eph['sun']
moon = eph['moon']
ts = load.timescale()

earth_r_km_equatorial = 6378.137
earth_r_km_polar = 6356.752
sun_r_km_equatorial = 695700
moon_r_km_equatorial = 1738.1

sun_r_e = sun_r_km_equatorial / earth_r_km_equatorial
moon_r_e = moon_r_km_equatorial / earth_r_km_equatorial

earth_flattening = (earth_r_km_equatorial - earth_r_km_polar) / earth_r_km_equatorial
earth_ellipticity_squared = 1 - pow(earth_r_km_polar,2)/pow(earth_r_km_equatorial,2)

def luna_to_julian(luna):
    return (luna * 29.5305891204) + 1721424.5
def julian_to_luna(julian):
    return (julian - 1721424.5) / 29.5305891204
def luna_to_utc(luna):
    return datetime(2000, 1, 6, tzinfo=UTC) + timedelta(luna * 29.5305891204)
def utc_to_luna(utc):
    return (utc - datetime(2000, 1, 6, tzinfo=UTC)).days / 29.5305891204

def get_new_moon(luna):
    tm = luna_to_utc(luna)
    t0 = ts.from_datetime(tm + timedelta(-8))
    t1 = ts.from_datetime(tm + timedelta(8))
    t, y = almanac.find_discrete(t0, t1, almanac.moon_phases(eph))
    phases = [ti for ti, yi in zip(t, y) if yi == 0]
    return phases[0]

def angular_separation(observer, t):
    moon_position = observer.at(t).observe(moon).apparent()
    sun_position = observer.at(t).observe(sun).apparent()
    return moon_position.separation_from(sun_position).degrees

def is_solar_eclipse_at_new_moon(new_moon_time, sep_param=0.5):
    search_window = 0.5
    t_check = new_moon_time - timedelta(days=search_window)
    t_end = new_moon_time + timedelta(days=search_window)
    min_separation = 180
    while t_check.utc_datetime() <= t_end:
        separation = angular_separation(earth, t_check)
        min_separation = min(min_separation, separation)
        t_check = t_check + timedelta(minutes=10)
    return min_separation < sep_param

def besselian_elements(t):

    sun_astrometric = earth.at(t).observe(sun).apparent()
    moon_astrometric = earth.at(t).observe(moon).apparent()

    s_ra, s_dec, _ = sun_astrometric.radec()
    s_dis = sun_astrometric.distance().km / earth_r_km_equatorial
    s_ra, s_dec = s_ra.radians, s_dec.radians

    m_ra, m_dec, _ = moon_astrometric.radec()
    m_dis = moon_astrometric.distance().km / earth_r_km_equatorial
    m_ra, m_dec = m_ra.radians, m_dec.radians

    x_s = s_dis * math.cos(s_dec) * math.cos(s_ra)
    y_s = s_dis * math.cos(s_dec) * math.sin(s_ra)
    z_s = s_dis * math.sin(s_dec)

    x_m = m_dis * math.cos(m_dec) * math.cos(m_ra)
    y_m = m_dis * math.cos(m_dec) * math.sin(m_ra)
    z_m = m_dis * math.sin(m_dec)

    s_arr = np.array([x_s, y_s, z_s])
    m_arr = np.array([x_m, y_m, z_m])
    g_arr = s_arr - m_arr
    g = np.linalg.norm(g_arr)

    a = math.atan((g_arr[1] / g)/(g_arr[0] / g))
    d = math.asin(g_arr[2] / g)

    gst = t.gast
    theta = gst * 15

    u = theta - (a * (180 / math.pi))

    x = m_dis * math.cos(m_dec) * math.sin(m_ra - a)
    y = (m_dis * (math.sin(m_dec) * math.cos(d) -
        math.cos(m_dec) * math.sin(d) * math.cos(m_ra - a)))
    z = (m_dis * (math.sin(m_dec) * math.sin(d) +
        math.cos(m_dec) * math.cos(d) * math.cos(m_ra - a)))

    sin_f1 = (sun_r_e + moon_r_e) / g
    sin_f2 = (sun_r_e - moon_r_e) / g

    c1 = z + (moon_r_e / sin_f1)
    c2 = z - (moon_r_e / sin_f2)

    tan_f1 = math.tan(math.asin(sin_f1))
    tan_f2 = math.tan(math.asin(sin_f2))

    l1 = c1 * tan_f1
    l2 = c2 * tan_f2

    d = d * (180 / math.pi)

    return x, y, d, l1, l2, u, tan_f1, tan_f2

def compute_besselian_element_polynomial_coefficients(t):
    A = np.array([
        [1, -2,  4, -8, 16],
        [1, -1,  1, -1,  1],
        [1,  0,  0,  0,  0],
        [1,  1,  1,  1,  1],
        [1,  2,  4,  8, 16],
    ], dtype=np.float64)

    elements = np.zeros((5,8), dtype=np.float64)
    for i, td in enumerate(range(-2, 3)):
        elements[i] = np.array(
            besselian_elements(t + timedelta(hours=td)), dtype=np.float64)

    x = np.linalg.solve(A, elements[:, 0])
    y = np.linalg.solve(A, elements[:, 1])
    d = np.linalg.solve(A, elements[:, 2])
    l1 = np.linalg.solve(A, elements[:, 3])
    l2 = np.linalg.solve(A, elements[:, 4])
    u = np.linalg.solve(A, elements[:, 5])
    tan_f1 = np.average(elements[:, 6])
    tan_f2 = np.average(elements[:, 7])

    return {
        't0': t.tt_calendar()[3],
        'x0': x[0],
        'x1': x[1],
        'x2': x[2],
        'x3': x[3],
        'y0': y[0],
        'y1': y[1],
        'y2': y[2],
        'y3': y[3],
        'd0': d[0],
        'd1': d[1],
        'd2': d[2],
        'l10': l1[0],
        'l11': l1[1],
        'l12': l1[2],
        'l20': l2[0],
        'l21': l2[1],
        'l22': l2[2],
        'mu0': u[0],
        'mu1': u[1],
        'mu2': u[2],
        'tan_f1': tan_f1,
        'tan_f2': tan_f2
    }

def eclipse_type(
    t0,
    x0,
    x1,
    x2,
    x3,
    y0,
    y1,
    y2,
    y3,
    d0,
    d1,
    d2,
    l10,
    l11,
    l12,
    l20,
    l21,
    l22,
    mu0,
    mu1,
    mu2,
    tan_f1,
    tan_f2,
):
    annular = False
    total = False

    for i in range(-20,21):
        t = i / 10
        x = x0 + x1 * t + x2 * pow(t, 2) + x3 * pow(t, 3)
        y = y0 + y1 * t + y2 * pow(t, 2) + y3 * pow(t, 3)
        d = d0 + d1 * t + d2 * pow(t, 2)
        omega = 1 / math.sqrt(1 - earth_ellipticity_squared * pow(math.cos(d),2)) * y
        B_squared = 1 - pow(x,2) - pow(omega,2)
        if B_squared > 0:
            B = math.sqrt(B_squared)

            l2 = l20 + l21 * t + l22 * pow(t, 2)
            x_prime = x1 + 2 * x2 * t + 3 * x3 * pow(t, 2)
            y_prime = y1 + 2 * y2 * t + 3 * y3 * pow(t, 2)
            p = mu1 / 57.2957795
            b = y_prime - p * x * math.sin(d)
            c = x_prime + p * y * math.sin(d)
            l2_prime = l2 - B * tan_f2
            a = c - p * B * math.cos(d)
            n = math.sqrt(pow(a,2) + pow(b,2))

            dur = l2_prime / n

            if dur < 0: total = True
            elif dur > 0: annular = True

    if total and annular: return 'H'
    elif total: return 'T'
    elif annular: return 'A'
    else: return 'P'

def pad(i, v=4):
    return f"{'-' if i < 0 else ''}{abs(i):0{v}d}"

def eclipse_info(luna, saros, inex):
    t = get_new_moon(luna)
    dt = t.utc_datetime()
    data = {
        "year": dt.year,
        "month": dt.month,
        "day": dt.day,
        "luna_num": luna,
        "saros": saros,
        "inex": inex,
        'julian_date': t.tt,
    }
    t_off = dt.minute >= 30
    be = compute_besselian_element_polynomial_coefficients(
        ts.utc(dt.year,dt.month,dt.day,dt.hour + t_off,))
    data['type'] = eclipse_type(**be)
    data['img'] = (
            "https://eclipse.gsfc.nasa.gov/5MCSEmap"
            f"/{pad((((data['year']-1)//100)*100)+1)}"
            f"-{pad((((data['year']-1)//100)+1)*100)}"
            f"/{data['year']}-{data['month']:02d}"
            f"-{data['day']:02d}.gif"
        )
    data.update(be)
    return data

def main():

    connection = sqlite3.connect("eclipses.db")
    try:
        cursor = connection.cursor()

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS eclipses (
                luna INTEGER PRIMARY KEY,
                year INTEGER,
                month INTEGER,
                day INTEGER,
                saros INTEGER,
                inex INTEGER,
                julian_date DOUBLE,
                type CHARACTER(1),
                img VARCHAR(128),
                t0 DOUBLE,
                x0 DOUBLE,
                x1 DOUBLE,
                x2 DOUBLE,
                x3 DOUBLE,
                y0 DOUBLE,
                y1 DOUBLE,
                y2 DOUBLE,
                y3 DOUBLE,
                d0 DOUBLE,
                d1 DOUBLE,
                d2 DOUBLE,
                l10 DOUBLE,
                l11 DOUBLE,
                l12 DOUBLE,
                l20 DOUBLE,
                l21 DOUBLE,
                l22 DOUBLE,
                mu0 DOUBLE,
                mu1 DOUBLE,
                mu2 DOUBLE,
                tan_f1 DOUBLE,
                tan_f2 DOUBLE
            )
        ''')
        connection.commit()

        query = '''
            INSERT INTO eclipses (
                luna, year, month, day, saros, inex, julian_date, type, img, t0,
                x0, x1, x2, x3, y0, y1, y2, y3, d0, d1, d2,
                l10, l11, l12, l20, l21, l22, mu0, mu1, mu2,
                tan_f1, tan_f2
            ) VALUES (
                :luna_num, :year, :month, :day, :saros, :inex, :julian_date, :type, :img, :t0,
                :x0, :x1, :x2, :x3, :y0, :y1, :y2, :y3, :d0, :d1, :d2,
                :l10, :l11, :l12, :l20, :l21, :l22, :mu0, :mu1, :mu2,
                :tan_f1, :tan_f2
            )
        '''

        # query = "SELECT luna, saros, inex FROM eclipses"
        # cursor.execute(query)
        # result = cursor.fetchall()
        result = cursor.execute("SELECT luna, saros, inex FROM eclipses").fetchall()

        # luna_start = -160800
        luna_start = -370
        luna_end = 160800

        # data = {}
        queue = []
        added = []
        i = 0

        if result:
            added += [row[0] for row in result]
            while result:
                luna, saros, inex = result.pop(0)
                if (luna - 223) not in added and luna_start <= (luna - 223) <= luna_end:
                    queue.append((luna - 223, saros, inex - 1))
                    added.append(luna - 223)
                if (luna + 223) not in added and luna_start <= (luna + 223) <= luna_end:
                    queue.append((luna + 223, saros, inex + 1))
                    added.append(luna + 223)
                if (luna - 358) not in added and luna_start <= (luna - 358) <= luna_end:
                    queue.append((luna - 358, saros - 1, inex))
                    added.append(luna - 358)
                if (luna + 358) not in added and luna_start <= (luna + 358) <= luna_end:
                    queue.append((luna + 358, saros + 1, inex))
                    added.append(luna + 358)
        else:
            queue.append((300, 139, 49))
            added.append(300)

        print(f"Starting with {len(queue)} in queue and {len(added)} added.")

        while queue:
            luna, saros, inex = queue.pop(0)
            if (luna - 223) not in added and luna_start <= (luna - 223) <= luna_end:
                queue.append((luna - 223, saros, inex - 1))
                added.append(luna - 223)
            if (luna + 223) not in added and luna_start <= (luna + 223) <= luna_end:
                queue.append((luna + 223, saros, inex + 1))
                added.append(luna + 223)
            if (luna - 358) not in added and luna_start <= (luna - 358) <= luna_end:
                queue.append((luna - 358, saros - 1, inex))
                added.append(luna - 358)
            if (luna + 358) not in added and luna_start <= (luna + 358) <= luna_end:
                queue.append((luna + 358, saros + 1, inex))
                added.append(luna + 358)
            cursor.execute(query, eclipse_info(luna, saros, inex))
            # connection.commit()
            i += 1
            if i % 100 == 0:
                connection.commit()
                i = 0
                # print("Changes added.")
            # data[f"{saros},{inex}"] = eclipse_info(luna, saros, inex)

        # with open("eclipses_new.json", 'w') as file:
        #     json.dump(data, file)
    except KeyboardInterrupt:
        print("Keyboard Interrupt.\nExiting...\n")
    finally:
        connection.close()

if __name__ == "__main__":

    # data = eclipse_info(300, 139, 49)

    # padding = max([len(k) for k in data.keys()]) + 1
    # for key, value in data.items():
    #     print(key.ljust(padding), value)

    main()
