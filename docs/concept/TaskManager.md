# TaskManager

Der Taskmanager führ Aufgaben in Reihenfolge und Priorität ab. Für das Orchestrieren der 
Aufgaben stehen Hilfsfunktionen zur Verfügung.

## Namespaces

Jeder Task muss in einem Namespace zugeordnet sein. Mehrere Tasks können sich den selben 
Namespace teilen. 

Wird ein Task ausgeführt dessen Namespace es noch nicht gibt, so wird dieser angelegt. 
Es wird der Event ```taskmanager::namespace::willCreate``` 
und ```taskmanager::namespace::hasBeenCreated``` geworfen.

Ist kein Task mit einem gleichen Namespace mehr in der Queue, so wird der Namespace 
entfernt. Es wird der Event ```taskmanager::namesapce::willDestroy``` 
und ```Taskmanager::namesapce::hasBeenDestroyed``` geworfen.

Namespaces werden anhand ihres Namens (String) erkannt. 


## Priorities

Es können die Folgenden drei Prioritäten gewählt werden un einen Task unabhängig vom 
Namespace einzusortieren: 

* IMMEDIATELY
* FOREGROUND
* BACKGROUND

Ein Task mit niedriger Indexnummer wird immer zuerst ausgeführt, gleich in welcher 
Priorität er sich befindet. 

## Ausführung

Ein Task kann parallel ausgeführt werden, Tasks in Namespaces werden immer sequeziell 
ausgeführt. 

## API

```
    var ns = taskmanager.createNamespace('namespace');
```

Erzeugt einen neuen Namespace. Wird ein Task für einen Namespace erzeugt, der noch nicht 
existiert, wird der Namepace implizit angelegt. 

Ein Namespace ist über ns ereichtabr, oder über des TaskManages funktion `getNamespace(namespace)`.

Ein Namespace hat die folgernden Properties: 

    - status (Status des Namespaces)
        - constructing (Namespace befindet sich im Aufbau)
        - ready (Namespace wartet auf Ausführung)
        - running (Mindestens ein Task eines Namespaces wird ausgeführt)
        - finished (Ausführung alles Tasks  beendet)
        - error (Es ist ein Fehler aufgetreten, der verhindert das der Namespace weter ausgeführt wird)
    - count (Anzal aller Tasks im Namespace)
    - left (Anzahl der Tasks die noch auf die Ausführung warten)
    - running (Anzahl der Tasks die sich gerade in Ausführung befinden [0 oder 1])
    - data (Datastore auf den alle Tassk des Namespace zugreifen können)

Ein Namespace hat die folgenden Funktionen

    - onStart(fn()) - Wenn der Status von `ready` nach `running` wechselt  
    - onFinish(fn()) - Wenn der Status von `running` nach `finished` wechselt
    - onError(fn(err)) - Wenn der Status nach `error` wechselt
    - beforeTask(fn())  - Befor ein neuer Task ausgeführt wird
    - afterTask(fn()) - Nachdem erin Task ausgeführt wurde
    - start() - Startet des Namespace und damit alle seine Tasks in ihm. Status wechelt von `constructing` zu `ready`
    - abort() - Stopt den Namespace! 
    - halt() - Pausiert den Namespace nach der aktuellen abarbeitung des laufenden Tasks
    - resume() - Lässt einen pausierten Namespace weiterlaufen

Es werden folgende Events geworfen: 

    - taskmanager::namespace::willCreate
    - taskmanager::namespace::didCreated

```
    var task = taskmanager.addTask('namespace', priority, taskFn);
```

Fügt eine Taskfunktion in einen Namespace ein. Existiert der Namespace noch nicht, wird 
dieser angelegt und sofort zur Ausführung gebracht. 

Die Priorität ist optional. 
Der Namespace kann ein Namespace-Objekt sein, oder ein der Name des Namespaces als String.

Eine Taskfunktion hat folgenden Envalope: 

    fn(scope, next)

Die Funktion muss next() aufrufen um die Ausführung weiter laufen zu lassen. next kann ein 
optionales Error() Objetzt bekommen. 
Der Namespace findet sich in scope wieder. Alle Propertie die an scope.* gehängt werden 
sind über alle Tasks im Namespace verfügbar. 

Ein Task hat die folgenden Properties:

    - status (Status des Tasks)
        - stage (der Namespace ist noch im Aufbau)
        - ready (der Task wartet auf Ausführung)
        - running (der Task wird gerade ausgeführt)
        - finished (der Task ist beendet)
        - error (der Task hat einen Fehler verursacht)

Ein Task hat keine Funktionen. 

Es werden folgende Events geworfen: 

    - taskmanager::task::willCreate
    - taskmanager::task::didCreated
    - taskmanager::info::eventcount::willChange
    - taskmanager::info::eventcount::didChanged



