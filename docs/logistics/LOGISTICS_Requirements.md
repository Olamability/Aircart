# Airmart Logistics — Requirements Specification

## 1. Purpose

Airmart Logistics is a first-party logistics operation owned and operated by Airmart.

Airmart allows customers and businesses to request delivery services independently of
whether the shipment originated from an Airmart marketplace purchase.

Third-party logistics providers are not part of the initial version.

The architecture must remain extensible enough to support external logistics operators
in the future without requiring a fundamental redesign.

## 2. Operating Model

Airmart controls:

- Logistics operations
- Drivers/riders
- Vehicles
- Dispatch
- Delivery assignments
- Shipment tracking
- Delivery completion
- Logistics pricing and configuration

Customers and businesses request delivery services from Airmart Logistics.

## 3. Requestors

### 3.1 Customers

Customers can:

- Create delivery requests
- Provide pickup information
- Provide destination information
- Provide package information
- View delivery pricing
- Pay for deliveries
- Track shipments
- View delivery history
- Cancel eligible shipments
- Receive delivery updates
- Report delivery problems

### 3.2 Businesses

Businesses can:

- Create delivery requests
- Manage pickup locations
- Create shipments
- Track shipments
- View delivery history
- Manage recipients
- View delivery costs

The architecture should support future business features such as bulk deliveries,
multiple staff members and business reporting.

## 4. Airmart Logistics Operations

Airmart logistics staff can:

- View incoming delivery requests
- Review shipments
- Manage dispatch
- Assign drivers/riders
- Assign vehicles
- Monitor active shipments
- Manage delivery exceptions
- Manage failed delivery attempts
- Reassign deliveries
- Investigate delivery issues
- Monitor logistics operations

## 5. Drivers / Riders

Airmart drivers/riders can:

- View assigned deliveries
- View authorized pickup information
- View authorized destination information
- Confirm arrival at pickup
- Confirm package pickup
- Update shipment status
- Confirm arrival at destination
- Record delivery attempts
- Submit proof of delivery
- Complete deliveries
- Report delivery problems

Drivers/riders cannot arbitrarily modify protected shipment information,
payment information, pricing or shipment ownership.

## 6. Super Admin

The existing Airmart Super Admin architecture remains the platform-level authority.

Super Admin may manage:

- Logistics configuration
- Delivery zones
- Pricing configuration
- Drivers/riders
- Vehicles
- Logistics permissions
- Operational settings
- Reports
- Auditing

Existing Airmart authentication, RBAC and authorization architecture must be reused.

## 7. Shipment Independence

A shipment may originate from:

1. An Airmart marketplace order.
2. An independent delivery request.

A logistics shipment must therefore not depend on an Airmart marketplace order.

A marketplace order may optionally reference a logistics shipment.

## 8. Ownership

Customers/businesses own their delivery requests and associated customer-facing
shipment records.

Airmart owns and controls logistics operational resources including:

- Drivers/riders
- Vehicles
- Dispatch operations
- Pricing configuration
- Logistics operations

Drivers/riders do not own shipments.

## 9. Initial Scope

The initial logistics system will support:

- Delivery requests
- Pickup locations
- Delivery destinations
- Package information
- Delivery pricing
- Driver/rider assignment
- Vehicle assignment
- Pickup confirmation
- Shipment tracking
- Delivery status updates
- Delivery attempts
- Proof of delivery
- Successful delivery
- Failed delivery
- Cancellation
- Returns where applicable
- Customer notifications
- Logistics operational management
- Logistics reporting

## 10. Out of Scope for v1

The following are explicitly excluded from the initial implementation:

- Third-party logistics-provider onboarding
- External logistics-company marketplace
- Partner logistics bidding
- Logistics-provider marketplace competition

The architecture may provide future extension points for these capabilities.
## 11. Delivery Types

Airmart Logistics v1 should support the following delivery types:

### 11.1 Standard Delivery

Normal delivery with the standard Airmart delivery workflow and pricing.

### 11.2 Express Delivery

Priority delivery intended for shipments requiring faster handling and delivery.

### 11.3 Scheduled Delivery

The customer or business selects a preferred delivery date/time window.

The system must distinguish between:

- Requested delivery time
- Confirmed delivery time
- Actual delivery time

### 11.4 Intercity Delivery

Delivery between different cities or locations.

Intercity delivery may have different:

- Pricing
- Delivery timelines
- Vehicle requirements
- Dispatch processes
- Tracking requirements

Intercity delivery should be designed for future expansion without requiring a separate
logistics system.

---

## 12. Shipment Lifecycle

Every shipment must have a controlled lifecycle.

### 12.1 Core Lifecycle

REQUESTED
→ CONFIRMED
→ PAYMENT_PENDING
→ PAID
→ AWAITING_ASSIGNMENT
→ ASSIGNED
→ DRIVER_EN_ROUTE_TO_PICKUP
→ ARRIVED_AT_PICKUP
→ PICKED_UP
→ IN_TRANSIT
→ ARRIVED_AT_DESTINATION
→ OUT_FOR_DELIVERY
→ DELIVERED
→ COMPLETED

### 12.2 Cancellation

A shipment may be cancelled when its current state permits cancellation.

Possible cancellation states include:

- CANCELLED_BY_CUSTOMER
- CANCELLED_BY_AIRMART
- CANCELLED_DUE_TO_PAYMENT
- CANCELLED_DUE_TO_OPERATIONAL_REASON

Cancellation rules must depend on the current shipment state.

For example, cancellation after successful pickup may require a different workflow
from cancellation before driver assignment.

### 12.3 Failed Delivery

A delivery attempt may fail.

Examples:

- Recipient unavailable
- Incorrect destination information
- Driver/rider unable to access destination
- Customer unavailable
- Operational problem
- Vehicle problem
- Safety issue

A failed delivery must be recorded as an event/attempt rather than simply changing
the shipment to an unexplained failed status.

The system should support subsequent actions such as:

- Retry delivery
- Contact customer
- Update delivery information
- Reassign driver/rider
- Return package
- Cancel shipment

### 12.4 Returned Shipment

A shipment may enter a return workflow when delivery cannot be completed.

Possible states include:

- RETURN_REQUESTED
- RETURN_IN_TRANSIT
- RETURNED

The exact return workflow will be defined before implementation.

---

## 13. Shipment Status Rules

Shipment status must be controlled by server-side business rules.

The client must not be allowed to arbitrarily change a shipment from one status
to another.

Every status transition must:

- Be validated
- Be authorized
- Be recorded
- Record who initiated the transition
- Record when it occurred
- Preserve the previous state where required

Example:

A driver cannot directly change:

IN_TRANSIT → DELIVERED

without completing the required delivery confirmation/proof-of-delivery workflow.

---

## 14. Tracking Events

Shipment status and shipment tracking history are separate concepts.

The shipment has a current status.

Tracking events provide the historical timeline.

Example:

2026-09-20 08:10
Shipment requested

2026-09-20 08:14
Payment confirmed

2026-09-20 08:25
Driver assigned

2026-09-20 09:02
Driver arrived at pickup

2026-09-20 09:08
Package picked up

2026-09-20 09:15
Shipment in transit

2026-09-20 10:01
Driver arrived at destination

2026-09-20 10:07
Package delivered

Tracking events must be immutable historical records.

They should not simply be overwritten when the current shipment status changes.

---

## 15. Shipment Completion

A shipment is considered completed only after the required delivery confirmation
workflow has been successfully completed.

Depending on the delivery configuration, completion may require:

- Recipient confirmation
- Delivery code/OTP
- Signature
- Photo proof
- Driver confirmation
- Timestamp
- Other approved proof-of-delivery method

The exact proof-of-delivery requirements will be defined in a later section.
## 16. Shipment Data Requirements

Every shipment must contain enough information for Airmart Logistics to safely,
accurately and efficiently process the delivery.

A shipment must not depend on an Airmart marketplace order.

A shipment may optionally reference an Airmart marketplace order when applicable.

---

## 16.1 Shipment Identification

Every shipment must have:

- Internal unique identifier
- Human-readable shipment/tracking number
- Shipment type
- Current shipment status
- Request date/time
- Created date/time
- Last updated date/time

The internal identifier and public tracking number must be separate.

The internal identifier is used by the application and database.

The public tracking number is used by customers and operations staff to identify
and track shipments.

---

## 16.2 Requestor

The shipment must identify who requested the delivery.

The requestor may be:

- Individual customer
- Business customer

The system must record the authenticated account responsible for creating the
shipment.

For business shipments, the shipment must also be associated with the relevant
business account where applicable.

---

## 16.3 Sender Information

The shipment must contain sender information.

Required sender information:

- Full name
- Phone number
- Pickup address
- Additional address/location details where required

Optional:

- Email address
- Pickup instructions
- Landmark
- Contact notes

The sender may be the same person/business that created the shipment, but this
must not be assumed.

A customer may request a shipment on behalf of another sender.

---

## 16.4 Recipient Information

The shipment must contain recipient information.

Required recipient information:

- Full name
- Phone number
- Delivery address

Optional:

- Email address
- Landmark
- Delivery instructions
- Contact notes

The recipient does not necessarily need to have an Airmart account.

---

## 16.5 Pickup Location

The pickup location must be stored separately from the requestor profile.

Required information should include:

- Address
- City
- State/region
- Country
- Contact name
- Contact phone number

The system should support additional location information such as:

- Landmark
- Area/neighborhood
- Postal code where applicable
- Coordinates where available
- Pickup instructions

The pickup location represents where the shipment physically begins.

---

## 16.6 Delivery Location

The destination must be stored separately from the requestor profile.

Required information should include:

- Address
- City
- State/region
- Country
- Recipient name
- Recipient phone number

The system should support:

- Landmark
- Area/neighborhood
- Postal code where applicable
- Coordinates where available
- Delivery instructions

The destination represents where the shipment is intended to end.

---

## 16.7 Package Information

Every shipment must contain package information sufficient for Airmart to determine
how it should be transported.

The system should support:

- Package description
- Package category/type
- Quantity
- Weight
- Length
- Width
- Height
- Fragile indicator
- Special handling requirements

Where appropriate, package dimensions should be stored using a consistent unit.

Weight should also use a consistent unit.

The system must validate package values and reject invalid or impossible values.

---

## 16.8 Package Category

The system should support predefined package categories.

Initial examples may include:

- Documents
- Clothing
- Electronics
- Food
- Groceries
- Medicine
- Household items
- Fragile goods
- Other

The final category list will be defined before implementation.

The system should allow the category system to expand without requiring a database
redesign.

---

## 16.9 Special Instructions

A shipment may contain instructions relevant to successful delivery.

Examples:

- Call recipient before arrival
- Leave with security
- Handle carefully
- Do not bend
- Keep upright
- Deliver during specified hours

Instructions must not be used to bypass safety, legal or operational restrictions.

---

## 16.10 Marketplace Order Reference

A shipment may optionally reference an Airmart marketplace order.

This relationship is optional.

Example:

A customer purchases a product on Airmart:

Marketplace Order
→ Logistics Shipment

But an independent delivery request has:

Logistics Shipment
→ No Marketplace Order

The logistics system must work correctly in both cases.

---

## 16.11 Delivery Scheduling Information

Where scheduled delivery is selected, the shipment may contain:

- Requested delivery date
- Requested delivery time window
- Confirmed delivery date
- Confirmed delivery time window

The system must distinguish between what the customer requested and what Airmart
actually confirmed.

---

## 16.12 Shipment Notes

Internal operational notes must be separated from customer-visible instructions.

Customer-visible information may include:

- Delivery instructions
- Recipient instructions

Internal information may include:

- Dispatch notes
- Operational notes
- Exception notes
- Investigation notes

Customers and drivers must not automatically have access to internal operational
notes.

---

## 16.13 Data Integrity

Shipment data must be validated on the server.

Validation must cover:

- Required fields
- Phone numbers
- Addresses
- Package quantities
- Weight
- Dimensions
- Delivery type
- Scheduling information
- Status transitions
- Ownership
- Authorization

The client must never be treated as the final authority for shipment data.

---

## 16.14 Sensitive Shipment Information

Shipment information may contain personally identifiable information such as:

- Names
- Phone numbers
- Addresses
- Delivery instructions
- Location information

Access must therefore be restricted according to the user's role and relationship
to the shipment.

A customer must only be able to access their authorized shipments.

A driver must only be able to access shipment information required for assigned
deliveries.

Airmart logistics staff must have access according to their operational permissions.

Super Admin access must remain controlled through the existing Airmart authorization
architecture.
## 17. Delivery Pricing

Airmart Logistics must have a controlled and configurable delivery pricing system.

Delivery pricing must not be hardcoded into the customer interface.

The final delivery price must be calculated and validated on the server.

---

## 17.1 Pricing Factors

The pricing engine should be capable of considering:

- Delivery type
- Pickup location
- Destination
- Distance
- Delivery zone
- Package weight
- Package dimensions
- Package quantity
- Vehicle type
- Express delivery
- Scheduled delivery
- Intercity delivery
- Additional handling requirements
- Applicable surcharges
- Applicable discounts

The exact pricing formula will be defined before implementation.

---

## 17.2 Distance Calculation

Where location coordinates are available, the system should calculate the estimated
distance between pickup and destination.

Distance should be represented using a consistent unit.

The system should distinguish between:

- Estimated distance
- Actual route distance where available

The customer-facing price must not depend solely on a distance value supplied by
the client.

Distance-related pricing must be calculated or verified by trusted server-side
logic.

---

## 17.3 Delivery Zones

Airmart Logistics should support configurable delivery zones.

Examples:

- Local zone
- Extended local zone
- Intercity zone
- Regional zone

The final zone structure must be determined based on Airmart's actual operating
model.

A shipment should be associated with the applicable pricing zone when the price
is calculated.

---

## 17.4 Base Delivery Fee

The pricing system should support a configurable base delivery fee.

Example concept:

Base Fee
+ Distance Charge
+ Package/Weight Charge
+ Service Charge
+ Optional Surcharges
- Applicable Discount
= Final Delivery Fee

This is a conceptual pricing model only.

The actual formula must be finalized before implementation.

---

## 17.5 Vehicle-Based Pricing

Different vehicle types may have different pricing.

Potential vehicle categories may include:

- Motorcycle
- Car
- Van
- Small truck
- Other approved vehicle types

The pricing system should allow Airmart to configure pricing according to the
vehicle required for the shipment.

---

## 17.6 Express Delivery Pricing

Express delivery may attract an additional fee.

The system should clearly separate:

- Standard delivery price
- Express surcharge

The surcharge must be calculated server-side.

---

## 17.7 Scheduled Delivery Pricing

Scheduled delivery may have different pricing rules depending on the selected
delivery window.

The pricing system must support configurable scheduled-delivery charges where
required.

---

## 17.8 Intercity Pricing

Intercity deliveries may use a different pricing model from local deliveries.

The system should support:

- Origin location
- Destination location
- Distance
- Route
- Vehicle type
- Package characteristics
- Delivery timeframe
- Intercity pricing rules

Intercity pricing must remain configurable rather than hardcoded into individual
shipment records.

---

## 17.9 Price Quote

Before confirming a shipment, the customer/business should receive a delivery
price quote.

A quote should provide enough information to understand the estimated cost.

The quote may include:

- Delivery type
- Estimated distance
- Base fee
- Distance charge
- Package/weight charge
- Vehicle charge
- Express/scheduled surcharge
- Discount
- Total delivery fee
- Quote validity/expiration where applicable

---

## 17.10 Quote vs Final Price

The system must distinguish between an estimated quote and the final confirmed
delivery price.

A quote may become invalid when:

- It expires
- Shipment details change
- Pickup changes
- Destination changes
- Package information changes
- Delivery type changes
- Pricing configuration changes

A new quote should be generated when relevant shipment details change.

---

## 17.11 Price Integrity

The customer/client must never be able to submit an arbitrary delivery price.

The server must calculate or validate the final amount before a shipment can be
confirmed for payment.

The amount submitted to Stripe or Paystack must come from trusted server-side
logic.

---

## 17.12 Pricing Configuration

Authorized Airmart staff should eventually be able to configure:

- Base fees
- Distance rates
- Zone rates
- Vehicle rates
- Weight/dimension charges
- Express surcharges
- Scheduled-delivery charges
- Intercity pricing
- Discounts
- Minimum delivery charges
- Maximum applicable charges where necessary

Changes to pricing configuration should be auditable.

Existing shipments must not unexpectedly change price because an administrator
changes future pricing rules.

The pricing rules used to calculate a confirmed shipment should therefore be
traceable.

---

## 17.13 Pricing Snapshot

When a shipment price is confirmed, the system should preserve the pricing
information used to calculate that amount.

The shipment should not depend on the current pricing configuration to reconstruct
its historical price.

The system should be able to answer:

> "Why did this shipment cost this amount?"

The recorded pricing information should therefore support auditing and customer
support.

---

## 17.14 Discounts and Promotions

The architecture should allow future support for:

- Promotional discounts
- Business discounts
- Customer discounts
- Delivery campaigns
- Coupon codes

However, advanced promotional functionality is not required for the initial
logistics implementation unless specifically approved.

---

## 17.15 Currency

The initial logistics implementation should use the platform's configured currency.

The logistics pricing system should avoid hardcoding currency assumptions into
business logic so that future expansion can support additional currencies if
required.
## 18. Driver, Rider, Vehicle & Dispatch Operations

Airmart Logistics is operated directly by Airmart.

Drivers and riders are Airmart-controlled logistics personnel.

Third-party logistics operators are not part of the initial implementation.

---

## 18.1 Driver / Rider Profile

Each Airmart driver or rider should have an operational profile.

The profile should support:

- Internal unique identifier
- Linked Airmart user account
- Full name
- Phone number
- Profile photo where applicable
- Driver/rider type
- Employment/engagement status
- Verification status
- Assigned operating area
- Availability status
- Emergency/contact information where required
- Date joined
- Date created
- Last updated

Sensitive personal information must only be accessible to authorized personnel.

---

## 18.2 Driver / Rider Status

The system should support operational availability states.

Initial examples:

- ACTIVE
- AVAILABLE
- BUSY
- OFF_DUTY
- SUSPENDED
- INACTIVE

The exact distinction between employment status and operational availability must
be maintained.

For example:

A driver may be ACTIVE as an Airmart driver but currently OFF_DUTY.

---

## 18.3 Driver Verification

Before a driver/rider can receive delivery assignments, Airmart should be able
to verify the required information.

Potential verification information may include:

- Identity information
- Driver's licence where applicable
- Vehicle documentation
- Insurance information where applicable
- Other regulatory documentation

The exact compliance requirements will be determined before implementation.

Verification status should be controlled server-side.

Unverified or suspended drivers must not receive normal delivery assignments.

---

## 18.4 Vehicle Management

Airmart should maintain a vehicle registry.

A vehicle should support:

- Internal unique identifier
- Vehicle registration number
- Vehicle type
- Make
- Model
- Year where applicable
- Capacity
- Weight capacity where applicable
- Current status
- Assigned driver where applicable
- Verification status
- Created date
- Updated date

Potential vehicle types:

- Motorcycle
- Car
- Van
- Truck
- Other approved logistics vehicle

The system must not assume that every driver permanently owns or uses one vehicle.

---

## 18.5 Vehicle Status

Vehicles should support operational states such as:

- AVAILABLE
- ASSIGNED
- IN_USE
- MAINTENANCE
- UNAVAILABLE
- RETIRED

A vehicle in maintenance, retired or otherwise unavailable must not be assigned
to a new shipment.

---

## 18.6 Driver-to-Vehicle Assignment

Airmart should support temporary or operational driver-to-vehicle assignments.

The system must not permanently assume:

Driver A → Vehicle A

because a driver may use different vehicles on different days or shifts.

Assignments should therefore be represented as operational records where appropriate.

---

## 18.7 Dispatch

Dispatch is responsible for assigning shipments to appropriate Airmart drivers/riders.

Dispatch should consider factors such as:

- Driver availability
- Vehicle availability
- Delivery location
- Pickup location
- Delivery type
- Package requirements
- Vehicle capacity
- Delivery schedule
- Driver workload
- Operating zone
- Operational priority

The initial system may use manual assignment.

Future versions may introduce automated dispatch.

---

## 18.8 Manual Dispatch

Authorized logistics staff should be able to:

- View unassigned shipments
- View available drivers
- View available vehicles
- Assign a driver/rider
- Assign a vehicle
- Reassign a shipment
- Cancel an assignment where permitted
- View assignment history

Every assignment action should be auditable.

---

## 18.9 Assignment Rules

A shipment must not be assigned to:

- Suspended driver
- Unverified driver
- Off-duty driver
- Unavailable driver
- Retired vehicle
- Vehicle under maintenance
- Vehicle incapable of handling the shipment requirements

The server must validate assignment eligibility.

The UI must not be considered the security boundary.

---

## 18.10 Driver Assignment Lifecycle

A shipment assignment should support states such as:

- ASSIGNED
- ACKNOWLEDGED
- DECLINED
- REASSIGNMENT_REQUIRED
- CANCELLED
- COMPLETED

The exact workflow will be finalized before implementation.

A shipment may have more than one assignment over its lifetime because reassignment
may be required.

Historical assignments should not simply be overwritten.

---

## 18.11 Pickup Operation

Once assigned, the driver/rider should receive the information required to complete
the pickup.

The pickup workflow should support:

1. Driver receives assignment
2. Driver acknowledges assignment
3. Driver travels to pickup
4. Driver arrives at pickup
5. Sender/package verification
6. Package pickup confirmation
7. Shipment status changes to PICKED_UP
8. Tracking event recorded
9. Delivery proceeds to transit

The exact package verification procedure will be defined later.

---

## 18.12 Delivery Operation

The delivery workflow should support:

1. Driver travels to destination
2. Driver arrives at destination
3. Recipient verification where required
4. Package handover
5. Proof of delivery
6. Delivery confirmation
7. Shipment status changes to DELIVERED
8. Tracking event recorded
9. Shipment becomes COMPLETED

---

## 18.13 Failed Delivery Attempt

A driver must be able to record a failed delivery attempt.

The attempt should record:

- Shipment
- Driver
- Date/time
- Attempt number
- Reason
- Notes
- Relevant evidence where applicable

Examples:

- Recipient unavailable
- Wrong address
- Recipient refused package
- Destination inaccessible
- Safety issue
- Vehicle issue
- Other operational reason

A failed attempt must not automatically mean the shipment is permanently failed.

Airmart operations should determine the next action.

---

## 18.14 Reassignment

A shipment may need to be reassigned because of:

- Driver unavailability
- Vehicle failure
- Driver decline
- Emergency
- Operational changes
- Failed pickup
- Other approved reason

The previous assignment must remain part of the historical record.

The new assignment becomes the active assignment.

---

## 18.15 Dispatch Audit Trail

Important dispatch operations should be auditable.

Examples:

- Assignment created
- Assignment acknowledged
- Assignment declined
- Driver changed
- Vehicle changed
- Assignment cancelled
- Shipment reassigned

Each event should record the responsible actor and timestamp.

---

## 18.16 Driver Access Restrictions

Drivers/riders should only access shipments assigned to them or information explicitly
required for their operational responsibilities.

They must not be able to:

- Browse all customer shipments
- View unrelated customer information
- Change shipment ownership
- Change payment status
- Change pricing
- Access internal financial records
- Modify protected customer account information

Authorization must be enforced server-side.

---

## 18.17 Future Dispatch Automation

The initial implementation may use manual dispatch.

The architecture should leave room for future automated dispatch based on:

- Location
- Availability
- Vehicle capacity
- Workload
- Delivery priority
- Estimated travel time
- Operating zones

Automated dispatch is not required for the initial version.
## 19. Tracking, Location & Proof of Delivery

Airmart Logistics must provide customers and authorized Airmart personnel with
appropriate shipment tracking information.

Tracking must balance operational usefulness, privacy, security and system
performance.

---

## 19.1 Tracking Model

Each shipment must have:

- A current shipment status
- A historical tracking timeline
- Relevant operational events
- Location information where available and appropriate

The current shipment status represents the latest known state.

Tracking events preserve the shipment's historical journey.

Tracking history must not be overwritten when a new event occurs.

---

## 19.2 Tracking Events

Tracking events may include:

- Shipment requested
- Payment confirmed
- Shipment confirmed
- Driver assigned
- Driver acknowledged assignment
- Driver heading to pickup
- Driver arrived at pickup
- Package picked up
- Shipment in transit
- Driver arrived at destination
- Out for delivery
- Delivery attempt
- Package delivered
- Shipment completed
- Shipment cancelled
- Shipment returned
- Other approved operational events

Each event should record:

- Shipment
- Event type
- Event timestamp
- Actor where applicable
- Source/system that generated the event
- Relevant location where appropriate
- Additional metadata where required

---

## 19.3 Location Data

Airmart may use geographic coordinates for logistics operations.

Potential location information includes:

- Pickup coordinates
- Destination coordinates
- Driver current/last-known coordinates
- Event coordinates
- Route-related coordinates where supported

Location information must only be collected when operationally justified.

---

## 19.4 Driver Location

During an active delivery, Airmart may collect a driver's current or recent
location to support:

- Dispatch
- Operational monitoring
- Customer tracking
- Estimated arrival information
- Delivery investigation
- Safety and operational support

The system must not continuously collect driver location when there is no legitimate
operational reason to do so.

Tracking frequency must be configurable and optimized for battery usage, network
usage and system performance.

---

## 19.5 Customer Tracking

Customers should be able to see appropriate shipment information.

Depending on the shipment state, the customer may see:

- Current shipment status
- Tracking timeline
- Pickup status
- Delivery status
- Assigned delivery information where appropriate
- Estimated arrival information where available
- Relevant driver/rider information where appropriate
- Delivery location progress where enabled

Customers should not automatically receive sensitive driver information.

The customer-facing tracking experience must expose only information required to
help the customer understand the shipment's progress.

---

## 19.6 Operational Tracking

Authorized Airmart logistics staff should have a more detailed operational view.

Operations may be able to see:

- Active shipments
- Shipment locations
- Driver locations
- Driver availability
- Delivery status
- Delays
- Exceptions
- Assignment information
- Operational events

Operational tracking access must be permission-controlled.

---

## 19.7 Location Accuracy

Location information must be treated as potentially approximate.

GPS and network-based locations may be inaccurate because of:

- Weak GPS signal
- Indoor environments
- Network positioning
- Device limitations
- Permission limitations

The system must not represent approximate location as exact when accuracy is
uncertain.

Where supported, location records may include accuracy information.

---

## 19.8 Proof of Delivery

Airmart must support proof-of-delivery mechanisms.

Possible proof methods include:

- Delivery confirmation
- Recipient OTP/code
- Recipient signature
- Delivery photograph
- Recipient name
- Driver confirmation
- Timestamp
- Other approved verification methods

The exact proof method may depend on the delivery type, shipment value or
operational requirements.

---

## 19.9 OTP / Delivery Code

For deliveries requiring stronger recipient verification, Airmart may generate
a delivery code or OTP.

The code should:

- Be generated securely
- Be associated with the shipment
- Have an appropriate expiration/lifecycle
- Not be exposed unnecessarily
- Be validated server-side
- Not be stored in plaintext where secure hashing is appropriate

A driver must not be able to mark a protected shipment as delivered simply by
submitting an arbitrary code.

---

## 19.10 Delivery Photograph

Where photo proof is enabled, the driver may submit a delivery photograph.

The system should record:

- Shipment
- Driver
- Timestamp
- Relevant location where appropriate
- Image reference
- Proof type

Images should be stored using the appropriate media/storage system rather than
being stored directly inside transactional database rows.

Access to delivery evidence must be restricted.

---

## 19.11 Signature

Where signature confirmation is required, the system may store a reference to
the signature record or captured signature representation.

Signature data must be protected because it may constitute sensitive delivery
evidence.

---

## 19.12 Proof-of-Delivery Immutability

Once a valid proof-of-delivery record has been created, it should not be silently
overwritten.

Corrections or disputes should create additional records or audit events.

The system must preserve evidence of what happened.

---

## 19.13 Delivery Completion

A delivery should only transition to DELIVERED/COMPLETED after all required
delivery confirmation conditions have been satisfied.

For example:

Standard low-risk delivery:
- Driver confirmation may be sufficient.

Protected delivery:
- Recipient OTP required.

High-value delivery:
- OTP + photograph/signature may be required.

The exact rules will be configurable and finalized before implementation.

---

## 19.14 Tracking Privacy

Location data and delivery evidence must be protected.

A customer should not be able to:

- View unrelated shipments
- View unrelated driver locations
- Access another customer's delivery evidence
- Access internal operational location history

Drivers should only access location and shipment information required for their
assigned work.

Airmart staff access must follow role and permission requirements.

---

## 19.15 Location Retention

Airmart should define how long detailed driver-location history is retained.

The system should avoid retaining high-frequency location data indefinitely when
there is no operational, legal or business requirement to do so.

Retention rules should be configurable where appropriate.

---

## 19.16 Tracking Reliability

Tracking must remain functional even when temporary network connectivity is poor.

The driver application should eventually support appropriate offline-safe behavior
for critical operational events where technically feasible.

Events must not be silently lost because of temporary connectivity problems.

The system should prevent accidental duplicate submission of the same operational
event.
## 20. Notifications & Communication

Airmart Logistics must provide timely communication about important shipment
events.

Notifications must be generated from trusted server-side events rather than
being triggered solely by client-side UI actions.

---

## 20.1 Notification Recipients

The system may send logistics notifications to:

- Customer
- Business customer
- Sender
- Recipient
- Driver/rider
- Airmart logistics operations staff
- Authorized administrators

A recipient should only receive information they are authorized to receive.

---

## 20.2 Customer Notifications

Customers should receive notifications for important shipment events.

Potential notifications include:

- Delivery request received
- Shipment confirmed
- Payment successful
- Payment failed
- Driver assigned
- Driver heading to pickup
- Driver arrived at pickup
- Package picked up
- Shipment in transit
- Shipment approaching destination
- Delivery attempt
- Delivery completed
- Delivery failed
- Shipment returned
- Shipment cancelled
- Refund initiated
- Refund completed
- Important delivery exception

---

## 20.3 Business Notifications

Business customers should receive appropriate notifications for their shipments.

The system should support future business workflows such as:

- Multiple active shipments
- Shipment status summaries
- Bulk delivery notifications
- Business delivery reports
- Delivery exception alerts

Business notifications must remain separated from individual customer notifications
where the information and permissions differ.

---

## 20.4 Recipient Notifications

A recipient does not necessarily need an Airmart account.

Where a valid recipient contact method is available, Airmart may notify the recipient
about relevant delivery events.

Potential notifications include:

- Upcoming delivery
- Driver approaching
- Delivery arrival
- Delivery verification requirement
- Delivery completion
- Failed delivery attempt

Recipient communication must expose only information necessary for the delivery.

---

## 20.5 Driver Notifications

Drivers/riders should receive operational notifications such as:

- New assignment
- Assignment changed
- Assignment cancelled
- Pickup reminder
- Delivery reminder
- Updated delivery instructions
- Operational alerts
- Reassignment
- Important dispatch messages

Driver notifications should not contain unnecessary customer-sensitive information.

---

## 20.6 Operations Notifications

Authorized Airmart logistics staff may receive alerts for:

- New delivery requests
- Unassigned shipments
- Delayed shipments
- Failed delivery attempts
- Driver availability problems
- Vehicle problems
- Operational exceptions
- High-priority shipments
- Payment issues affecting delivery
- System or dispatch problems

The notification system should eventually support configurable operational alerts.

---

## 20.7 Notification Channels

The architecture should support multiple communication channels.

Potential channels include:

- In-app notifications
- Email
- SMS
- Push notifications
- WhatsApp where legally and technically appropriate

The initial implementation does not need to activate every channel.

The notification architecture should allow additional channels to be introduced
without redesigning shipment business logic.

---

## 20.8 Notification Preferences

Customers and businesses should eventually be able to manage appropriate notification
preferences.

Preferences may include:

- Email
- SMS
- Push
- Marketing communication
- Operational communication

Critical logistics notifications must not be disabled when doing so would prevent
the customer from receiving essential information about an active shipment.

---

## 20.9 Notification Events

Notifications should be triggered by defined domain events.

Examples:

```text
SHIPMENT_CREATED
PAYMENT_CONFIRMED
DRIVER_ASSIGNED
DRIVER_ARRIVED_PICKUP
PACKAGE_PICKED_UP
SHIPMENT_IN_TRANSIT
DRIVER_APPROACHING_DESTINATION
DELIVERY_ATTEMPTED
SHIPMENT_DELIVERED
SHIPMENT_CANCELLED
SHIPMENT_RETURNED
REFUND_INITIATED
REFUND_COMPLETED

### Then stop.

Next is **Section 21 — Cancellation, Failed Delivery, Returns & Refunds**.

That section is the last major business-rule section before we start converting everything we've defined into the **actual domain entities and relationships**.
## 21. Cancellation, Failed Delivery, Returns & Refunds

Airmart Logistics must define clear rules for cancellation, failed delivery,
returns and refunds.

These operations must be controlled by server-side business rules.

---

## 21.1 Customer Cancellation

A customer or business may request cancellation when the shipment's current state
allows cancellation.

Cancellation eligibility must depend on shipment status.

For example:

- Before payment: cancellation may be immediate.
- After payment but before assignment: cancellation may be allowed.
- After driver assignment: cancellation may have conditions.
- After pickup: cancellation becomes a different operational workflow.
- After delivery: normal cancellation is no longer applicable.

The exact cancellation policy will be finalized before implementation.

---

## 21.2 Cancellation Request vs Cancellation

A customer requesting cancellation does not necessarily mean the shipment is
immediately cancelled.

Where operational review is required:

```text
Customer requests cancellation
        ↓
Server validates eligibility
        ↓
Cancellation approved/rejected
        ↓
Shipment state updated
        ↓
Refund workflow initiated if applicable
## 23. Data Architecture

Airmart Logistics will use a domain-appropriate data architecture.

The core principle is:

> Sanity describes the service and its content.
> Supabase records operational and transactional activity.
> Clerk manages identity and authentication.
> Stripe/Paystack handles payment processing.

### 23.1 Supabase / PostgreSQL

Supabase/PostgreSQL will be the primary transactional database for Airmart Logistics.

It will store operational data including:

- Customer/business delivery requests
- Shipments
- Shipment parties
- Pickup and destination snapshots
- Shipment packages
- Delivery quotes
- Pricing snapshots
- Drivers/riders
- Driver verification records
- Vehicles
- Driver/vehicle assignments
- Dispatch records
- Tracking events
- Driver location/activity data where required
- Delivery attempts
- Proof of delivery records
- Operational exceptions
- Cancellations
- Returns
- Payments
- Refunds
- Disputes
- Notifications and notification delivery records
- Operational audit records
- Logistics configuration required for transactional decisions

Supabase is the source of truth for the current operational state of a shipment.

### 23.2 Sanity CMS

Sanity will manage non-transactional logistics content.

Potential content includes:

- Logistics service descriptions
- Delivery service types
- Public service information
- FAQs
- Help content
- Customer-facing instructions
- Promotional content
- Logistics-related images/media
- Public information about delivery options
- Other editorial content that does not represent transactional state

Sanity must not be treated as the authoritative source for:

- Shipment status
- Payment status
- Driver assignment
- Delivery completion
- Tracking history
- Refund state
- Operational exceptions
- Ownership or authorization decisions

### 23.3 Clerk

Clerk remains the authentication and identity layer.

Clerk will manage:

- User authentication
- Sessions
- User identity
- Account security
- User metadata/roles where applicable

Logistics transactional records may reference the authenticated Clerk user through a stable Clerk user identifier.

The logistics database must still enforce authorization server-side.

A Clerk identity alone must never grant unrestricted access to logistics records.

### 23.4 Payment Providers

Stripe and/or Paystack will process payments.

The logistics domain will maintain its own payment records containing information such as:

- Internal payment ID
- Shipment reference
- Provider
- Provider transaction/reference ID
- Amount
- Currency
- Payment status
- Payment timestamps
- Refund information where applicable

The payment provider remains responsible for processing the actual payment.

Supabase remains responsible for the application's payment record and relationship to the shipment.

Payment confirmation must be verified server-side.

Webhook events must be validated before changing payment state.

### 23.5 Source of Truth

Each domain must have a clearly defined source of truth.

| Data | Source of Truth |
|---|---|
| User authentication | Clerk |
| User identity | Clerk |
| Logistics transaction | Supabase |
| Shipment status | Supabase |
| Tracking history | Supabase |
| Driver assignment | Supabase |
| Vehicle assignment | Supabase |
| Payment transaction record | Supabase |
| Payment processing | Stripe/Paystack |
| Refund processing | Stripe/Paystack |
| Logistics public content | Sanity |
| Logistics media/content | Sanity |
| Pricing operational configuration | Supabase |
| Shipment pricing snapshot | Supabase |
| Authorization | Existing Airmart server-side RBAC |

### 23.6 Historical Integrity

Transactional records must preserve historical state.

Changing current configuration must not rewrite historical shipments.

For example:

- Changing delivery pricing must not change an old shipment's final price.
- Changing a driver's profile must not rewrite historical assignment records.
- Changing a customer's address must not change an old shipment's pickup/destination.
- Changing vehicle information must not alter historical delivery records.
- Changing payment configuration must not invalidate historical payment records.

Where historical information is required, the relevant values must be stored as snapshots or immutable historical records.

### 23.7 Server-Side Boundary

The browser must never be trusted with authoritative logistics decisions.

The server must independently:

- Authenticate the user
- Check permissions
- Check ownership/access
- Validate shipment state
- Validate input
- Calculate or verify pricing
- Verify payment state
- Validate status transitions
- Create tracking events
- Record assignments
- Validate proof of delivery
- Process cancellations
- Process refunds where authorized
- Write audit records

Client-side state is for presentation and user interaction only.

### 23.8 Existing Airmart Architecture

The logistics domain will integrate with the existing Airmart architecture rather than replacing it.

Existing systems remain responsible for their existing domains:

- Clerk → authentication
- Existing Airmart RBAC → authorization
- Sanity → marketplace/content management
- Zustand → client-side application state
- Stripe/Paystack → payment processing

Supabase will be introduced specifically where relational, transactional, operational, and historical logistics data requires a database designed for that workload.

### 23.9 Domain Independence

A logistics shipment must remain independent from marketplace orders.

A shipment may optionally reference an Airmart marketplace order.

Therefore:

- Marketplace order → may create/reference a shipment.
- Independent customer delivery → may create a shipment without an order.
- Business delivery request → may create a shipment without an order.
- Shipment → must not require an order to exist.

This ensures Airmart Logistics remains a standalone Airmart service while still integrating naturally with marketplace purchases.

### 23.10 Future Scalability

The initial implementation will remain focused on Airmart's first-party logistics operation.

The architecture should remain extensible for future capabilities such as:

- Automated dispatch
- Advanced driver tracking
- Route optimization
- Bulk business shipments
- Delivery zones
- Dynamic pricing
- Scheduled delivery
- Intercity logistics
- Additional payment providers
- External logistics operators in a future version

These capabilities must not be introduced prematurely if they are not required for the initial system.
## 24. Supabase Database Schema

Airmart Logistics will use a relational PostgreSQL schema.

The schema will prioritize:

- Strong relationships
- Referential integrity
- Historical integrity
- Server-side authorization
- Auditability
- Idempotency
- Scalability
- Clear ownership boundaries
- Efficient operational queries

### 24.1 Core Tables

The initial logistics database will contain the following primary domains.

#### Requestors and Profiles

- `logistics_customer_profiles`
- `logistics_business_profiles`

These represent customers and businesses using Airmart Logistics.

They reference the authenticated Airmart/Clerk identity where applicable.

---

#### Shipments

- `logistics_shipments`

The central logistics aggregate.

A shipment represents a delivery request and contains references to:

- Requestor
- Optional marketplace order
- Delivery type
- Current status
- Current payment status
- Pricing/quote
- Pickup
- Destination
- Scheduling information
- Creation/update timestamps

The shipment is the central record around which the operational lifecycle is built.

---

#### Shipment Parties and Locations

- `logistics_shipment_parties`
- `logistics_shipment_locations`

These preserve sender, recipient, pickup and destination information associated with the shipment.

Shipment location information must be treated as historical snapshots rather than relying exclusively on mutable customer profile data.

---

#### Packages

- `logistics_shipment_packages`

A shipment may contain one or more packages.

Package records may contain:

- Description
- Category
- Quantity
- Weight
- Dimensions
- Fragile flag
- Special handling requirements
- Package instructions

This allows the system to support multiple packages without redesigning the shipment model later.

---

#### Quotes and Pricing

- `logistics_quotes`
- `logistics_pricing_snapshots`
- `logistics_pricing_rules`
- `logistics_delivery_zones`

Quotes represent prices presented to customers before confirmation.

Pricing snapshots preserve the pricing actually applied to a shipment.

Pricing rules and zones provide the configurable operational pricing structure.

Historical shipment pricing must never depend on the current pricing rules.

---

#### Drivers and Vehicles

- `logistics_drivers`
- `logistics_driver_verifications`
- `logistics_vehicles`

These represent Airmart's operational logistics resources.

Drivers reference the appropriate authenticated Airmart identity.

Vehicles are maintained separately from drivers because driver-vehicle relationships can change.

---

#### Dispatch and Assignments

- `logistics_dispatches`
- `logistics_assignments`

Dispatch represents the operational process of assigning resources.

Assignments preserve:

- Driver
- Vehicle
- Shipment
- Assignment state
- Assignment timestamps
- Acknowledgement
- Decline/reassignment information

Assignment history must be preserved rather than overwriting previous assignments.

---

#### Tracking

- `logistics_tracking_events`

This is an append-only operational timeline.

Examples:

- Shipment requested
- Shipment confirmed
- Payment received
- Driver assigned
- Driver acknowledged
- Driver arrived at pickup
- Package picked up
- Shipment in transit
- Arrived at destination
- Delivery attempted
- Delivered
- Cancelled
- Returned

The current shipment status is stored separately for fast operational queries.

Tracking events provide the historical explanation of how that state was reached.

---

#### Driver Location

- `logistics_driver_locations`

This table is intended for operational driver location/activity data where required.

Location collection must follow the privacy, retention and operational rules defined earlier.

Because location data may grow rapidly, retention and indexing must be considered carefully.

---

#### Delivery Attempts

- `logistics_delivery_attempts`

Each pickup or delivery attempt should be recorded independently.

Records may include:

- Shipment
- Driver
- Attempt type
- Attempt status
- Reason
- Timestamp
- Location
- Notes
- Supporting evidence where applicable

Attempts must never be silently overwritten.

---

#### Proof of Delivery

- `logistics_proof_of_delivery`

Stores the authoritative delivery confirmation record.

Possible proof methods include:

- OTP
- Recipient confirmation
- Signature
- Photo
- Recipient name
- Driver confirmation
- Timestamp

Media itself should be stored using an appropriate storage system rather than directly inside the transactional row.

---

#### Exceptions and Operational Issues

- `logistics_exceptions`

Records operational problems such as:

- Driver unavailable
- Vehicle breakdown
- Accident
- Unsafe route
- Weather issue
- Incorrect address
- Package discrepancy
- Prohibited item
- Payment problem
- System issue

Exceptions remain historically available even after resolution.

---

#### Cancellations and Returns

- `logistics_cancellations`
- `logistics_returns`

Cancellation records preserve:

- Who requested/initiated cancellation
- Reason
- Timestamp
- Previous state
- Resulting state

Returns preserve the return lifecycle independently from the original shipment.

---

#### Payments and Refunds

- `logistics_payments`
- `logistics_refunds`

Payment records represent the application's financial transaction state.

Refund records represent refund attempts and outcomes.

Payment status and shipment status remain separate concepts.

---

#### Disputes

- `logistics_disputes`

Disputes may cover:

- Package not received
- Damaged package
- Incorrect package
- Missing package
- Unauthorized proof
- Incorrect charge
- Other delivery disputes

Disputes must preserve their history and resolution information.

---

#### Notifications

- `logistics_notifications`

Stores operational notification records and delivery attempts.

Notifications may be associated with:

- Customer
- Business
- Recipient
- Driver
- Operations staff
- Authorized administrators

The notification record should support retries and provider references.

---

#### Audit

- `logistics_audit_logs`

Records security-sensitive and operationally important actions.

Examples:

- Shipment status changes
- Pricing changes
- Assignment changes
- Cancellation
- Refund
- Manual operational override
- Driver suspension
- Vehicle status change
- Administrative changes

Audit records must be append-oriented and protected from unauthorized modification.

### 24.2 Primary Relationship

The central relationship is:

Requestor
→ Shipment
→ Package(s)
→ Quote/Pricing
→ Assignment
→ Driver/Vehicle
→ Tracking Events
→ Delivery Attempts
→ Proof of Delivery

Supporting relationships include:

Shipment
→ Payment
→ Refund

Shipment
→ Cancellation

Shipment
→ Return

Shipment
→ Exception

Shipment
→ Dispute

Shipment
→ Notification

Shipment
→ Audit Events

Shipment
→ Optional Marketplace Order

### 24.3 Important Design Rule

`logistics_shipments` is the operational center of the logistics domain.

However, it must not become a giant table containing every piece of logistics information.

Operational concerns should remain separated into related tables so that:

- Shipment records remain manageable.
- History remains append-oriented.
- High-volume tracking data can scale independently.
- Payment records remain isolated.
- Driver information remains reusable.
- Assignment history is preserved.
- Proof and evidence remain controlled.
- Future features can be added without redesigning the shipment table.

### 24.4 No Premature SQL

The table list above is the logical schema.

Before creating the actual Supabase tables, each table will be reviewed for:

- Exact columns
- Data types
- Primary keys
- Foreign keys
- Nullable fields
- Unique constraints
- Check constraints
- Indexes
- Delete/update behavior
- Row Level Security
- Server-only operations
- Audit requirements

SQL migrations will only be written after this review.