# enkrino

## enkrino是什么？
enkrio是一个极简的业务流程引擎。

## 为什么enkrino

[业务流程（business process）](https://en.wikipedia.org/wiki/Business_process)是一组相关的、具有结构的活动，这组活动按特定顺序被执行可产出产品或服务。[BPMN](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation)是当前应用最广的业务流程描述规范之一，主流的业务流程执行引擎如Activiti、Camunda、Flowable等也以支持BPMN业务模型为主。

虽然BPMN应用广泛，但它在某些场景下仍然存在不足。例如我们经常会使用BPMN建模一个如下图所示“审批”流程。

![Approval Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/flow0.puml)

但实际运行过程中，审批业务一般允许进行退回操作，如下图所示。

![Reject Process](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/flow1.puml)

当然还可能存在更复杂的退回逻辑。例如下图所示，任意一个后续活动可以退回到任意一个前序活动。

![Reject Process 2](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/flow2.puml)


若需要支持“回退”逻辑，那采用BPMN这类的活动图来进行审批流程建模就需要在模型中表达出这样的活动关系。当流程节点数量增加时，回退关系的数量会呈几何级数增长。

此外，实际业务中可能还存在“回退后可直接提交至回退发起节点”这样的需要。如下图所示，如果“总办审批”直接回退到“发起申请”活动，则发起者可以修改后直接提交至总办进行重新审批。

![Reject Process 3](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/flow3.puml)

这一问题存在的根本是BPMN模型的执行引擎只依据设计时的静态模型进行执行，所以执行时退回、退回提交等复杂情况需要在BPMN中进行显式建模方可实现。

为此我们开发enkrino引擎以解决这一问题，在建模过程简单化和执行过程灵活化之间取得平衡。

# enkrino设计理念

enkrino的核心思想是在运行时基于流程模型执行的历史记录动态决定流程的下一个合法状态。

引擎内为每个部署运行的模型自动构建一个“镜像模型”，初始状态下，镜像模型只包含设计模型中的所有节点，并且在每个节点的状态数据中维护一个执行上下文栈（下简称ECS），用以存放每个节点执行时的各类状态数据。
![enkrino1](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino1.puml)

我们用以下5个步骤说明enkrino的运行过程。

### 步骤1
流程启动后进入`S1`执行，我们在S1的ECS中加入`start->S1|starting context`

![enkrino2](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino2.puml)

在此之后引擎如果完成`S1`，则下一个状态的选择根据设计模型与镜像模型共同决定：两个模型中S1的后续节点都可以是引擎可选的下一个执行节点。根据当前状态，`S1`在设计模型中存在后续节点`S2`或`S3`（此处省略了条件选择状态)，镜像模型中`S1`无后续节点，所以引擎可选择`S2`或`S3`。

### 步骤2
假设引擎选择进入`S2`状态继续执行，则我们在镜像模型中记录`S1`执行中的上下文`S1->S2|context1`，并在镜像模型中添加`S2`到`S1`的**后向边**，表示此时`S2`除了model中的路径外，额外添加了一条可以回退到`S1`的路径。



![enkrino3](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino3.puml)

在此之后引擎如果完成`S2`，根据前述下一节点选择规则，`S2`后续可进入`S4`（设计模型中的后续）或`S1`（镜像模型中的后续，即`S1`一个合法的回退节点）。

### 步骤3
假设引擎选择进入`S4`状态继续执行，则我们在镜像模型中记录`S4`执行中的上下文`S2->S4|context2`，并在镜像模型中添加`S4`到`S2`的后向边。

![enkrino4](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino4.puml)


在此之后引擎如果完成`S4`，根据前述下一节点选择规则，`S4`后续可进入`S2`（设计模型中的后续）或`S1`（镜像模型中的后续，即`S1`一个合法的回退节点）。

### 步骤4
假设选择`S1`，则为回退到合法的历史节点，此时我们在镜像模型中记录`S1`执行中的上下文`S4->S1|context3`，并在镜像模型中添加`S1`到`S4`的**前向边**，表示`S1`除了model中的路径以外，额外增加了一条直接到达`S4`的路径，


![enkrino5](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino5.puml)

### 步骤5
最后，我们再用图示表现`S1->S3->S4`的状态转换过程，这与前述`S1->S2->S4`的过程是类似的。

![enkrino6](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino6.puml)

![enkrino7](http://www.plantuml.com/plantuml/proxy?cache=no&src=https://raw.githubusercontent.com/nemoworks/enkrinojs/master/docs/diagrams/enkrino7.puml)


# enkrino提供的接口

enkrino提供**纯函数**接口，其过程为从当前状态到下一个状态的求解。即enkrino不保存状态，而是接受当前状态作为输入，计算下一状态作为输出。

状态转移接口如下：

```bash
#启动流程
start(state) -> nextState

#获取当前节点的所有合法后继节点，包括设计模型中和镜像模型中的所有当前节点的后继节点
getNexts(state, current) -> [nextSteps]

#由当前节点前往指定节点，如指定节点为非法后继节点，不可到达，则状态保持不变
goNext(state, current, next) -> nextState

#结束流程
finish(state) -> finishedState
```
