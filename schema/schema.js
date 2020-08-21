const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
} = graphql;

// ----------------------------- TYPES ----------------------------- //
// PET OBJECT TYPE
const PetType = new GraphQLObjectType({
    // STRING THAT DESCRIBES TYPE
    name: 'Pet',
    // OBJECT THAT TELLS GRAPHQL ABOUT ALL PROPERTIES ON THIS TYPE
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        // ADDING RELATIONSHIP TO COMPANY
        company: {
            type: CompanyType,
            // PARENT VALUE - ONE LEVEL UP, PET
            resolve(parentValue, args) {
                return axios
                    .get(
                        `http://localhost:3000/companies/${parentValue.companyId}`
                    )
                    .then((response) => response.data);
            },
        },
    }),
});

// COMPANY OBJECT TYPE
const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        pet: {
            type: PetType,
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/pets/${parentValue.id}`)
                    .then((response) => response.data);
            },
        },
    }),
});
// ----------------------------- TYPES ----------------------------- //

// ----------------------------- MUTATIONS ----------------------------- //
const mutation = new GraphQLObjectType({
    name: 'Mutation',
    // EACH FIELD MEANS DIFFERENT ACTION
    fields: {
        addPet: {
            type: PetType,
            // ARGS INDICATES WHAT TYPES OF ARGUMENTS ARE EXPECTED
            args: {
                firstName: { type: GraphQLString },
                age: { type: GraphQLInt },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, { firstName, age, companyId }) {
                return axios
                    .post(`http://localhost:3000/pets`, {
                        firstName,
                        age,
                        companyId,
                    })
                    .then((response) => response.data);
            },
        },
    },
});
//hackernoon.com/mutations-in-graphql-9ac6a28202a2
// ----------------------------- MUTATIONS ----------------------------- //

// ----------------------------- ROOT QUERY ----------------------------- //
// GraphQLObjectType has two required properties:
// name( string that describes type being defined, capital )
// and fields ( object that tells graphql about properties on this type )
const rootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // PET MUTATION
        pet: {
            // indicating the type of object that will be given back
            type: PetType,
            // expects an argument of iD / CAN FILTER BY ARGUMENT WHEN QUERY
            args: { id: { type: GraphQLString } },
            // resolver is a function that returns data reflecting arguments passed into request
            resolve(parentValue, args) {
                return (
                    axios
                        // using id property from arguments that was passed into request
                        .get(`http://localhost:3000/pets/${args.id}`)
                        .then((response) => response.data)
                );
            },
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },
            resolve(parentValue, args) {
                return axios
                    .get(`http://localhost:3000/companies/${args.id}`)
                    .then((response) => response.data);
            },
        },
    },
});
// ----------------------------- ROOT QUERY ----------------------------- //

module.exports = new GraphQLSchema({
    query: rootQuery,
    mutation,
});

// QUERY EXAMPLE
// {
//   pet(id: "1") {
//     age
//   }
// }
