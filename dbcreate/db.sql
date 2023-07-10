CREATE TABLE route_pass (
    route_id SERIAL PRIMARY KEY,
    route_pass VARCHAR(255),
    active boolean
);

CREATE TABLE routes (
    pass_id int REFERENCES route_pass(route_id),
    route VARCHAR(255)
);

CREATE TABLE tokens (
    token VARCHAR(255)
);



SELECT route
FROM routes
INNER JOIN route_pass ON routes.pass_id = route_pass.route_id
WHERE route_pass = 'route_pass';


SELECT route FROM routes INNER JOIN route_pass ON routes.pass_id = route_pass.route_id WHERE route_pass = 'J412J6MJUW';

SELECT route FROM routes INNER JOIN route_pass ON routes.pass_id = route_pass.route_id WHERE route_pass.route_pass = 'J412J6MJUW' LIMIT 1;

DELETE FROM routes WHERE pass_id IN (SELECT route_id FROM route_pass WHERE route_pass = $1);
