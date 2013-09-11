json-reference

Project Layout:

    angular-ui - the Angular Portion of the project (runs on port 8900 by executing command: grunt server) 
    config.js - the configuration for the node server (useCors or not to useCors?)
    request-handler.js - the "worker" in the service, it handles each request and has the business logic of "how to handle" the request.
    server.js - the actual server bootstrap. this is what you ask node to run.


Running the project:

    $ node server.js &
    $ cd angular-ui
    $ grunt server


