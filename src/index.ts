import express from 'express';
import { PrismaClient } from '@prisma/client';
import { graphqlHTTP } from 'express-graphql';
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLInt, GraphQLList } from 'graphql';

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// 1. Định nghĩa các Type trong GraphQL
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
    }),
});

// 2. Định nghĩa các Query (Truy vấn)
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        // Lấy danh sách tất cả người dùng
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return prisma.user.findMany();
            },
        },
        // Lấy một người dùng theo ID
        user: {
            type: UserType,
            args: { id: { type: GraphQLString } },
            resolve(parent, args) {
                return prisma.user.findUnique({ where: { id: args.id } });
            },
        },
    },
});

// 3. Định nghĩa các Mutation (Thao tác thêm, sửa, xóa)
const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                name: { type: GraphQLString },
                age: { type: GraphQLInt },
            },
            resolve(parent, args) {
                return prisma.user.create({
                    data: {
                        name: args.name,
                        age: args.age,
                    },
                });
            },
        },
        updateUser: {
            type: UserType,
            args: {
                id: { type: GraphQLString },
                name: { type: GraphQLString },
                age: { type: GraphQLInt },
            },
            resolve(parent, args) {
                return prisma.user.update({
                    where: { id: args.id },
                    data: {
                        name: args.name,
                        age: args.age,
                    },
                });
            },
        },
        deleteUser: {
            type: UserType,
            args: {
                id: { type: GraphQLString },
            },
            resolve(parent, args) {
                return prisma.user.delete({
                    where: { id: args.id },
                });
            },
        },
    },
});

// 4. Cấu hình Schema GraphQL
const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});

// 5. Cấu hình GraphQL endpoint
app.use('/graphql', graphqlHTTP({
    schema,
}));

// 6. Khởi động máy chủ
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000/graphql');
});
